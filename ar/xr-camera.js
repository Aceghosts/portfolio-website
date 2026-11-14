/* Camera frames out of a WebXR immersive-ar session (WebXR Raw Camera Access, Chrome Android),
   as a small upright 2D canvas that MediaPipe can read. No dependencies; shares three's GL context.

   Frame loop contract (inside renderer.setAnimationLoop(function(t, frame){ ... })):
     1. var img = feed.capture(frame, renderer.xr.getReferenceSpace());   // or feed.syncState() on frames you skip
     2. if (img) handLandmarker.detectForVideo(img.canvas, t);
     3. renderer.render(scene, camera);
*/

export const XR_CAMERA_FEATURE = "camera-access";   /* https://immersive-web.github.io/raw-camera-access/#feature-descriptor */

const COS = [1, 0, -1, 0];   /* cos of k quarter turns; sin(k) = COS[(k + 3) % 4] */
const VERT ="attribute vec2 a_p; varying vec2 v_p; void main(){ v_p = a_p; gl_Position = vec4(a_p, 0.0, 1.0); }";
/* v_p is the clip position of the output pixel. readPixels row 0 is clip y = -1 and becomes canvas row 0 (the top),
   so the screen-space "up" of an output pixel is -v_p.y: that negation is the vertical flip, done here for free.
   Four taps a quarter pixel apart turn the one bilinear fetch into a 4x4 box, enough for a 4x to 6x downscale
   of a texture we are not allowed to mipmap. */
const FRAG =
  "precision mediump float; uniform sampler2D u_t; uniform mat2 u_m; uniform vec2 u_d; varying vec2 v_p;" +
  "vec4 tap(vec2 o){ vec2 p = v_p + o * u_d; return texture2D(u_t, 0.5 + 0.5 * (u_m * vec2(p.x, -p.y))); }" +
  "void main(){ vec4 c = tap(vec2(-1.0, -1.0)) + tap(vec2(1.0, -1.0)) + tap(vec2(-1.0, 1.0)) + tap(vec2(1.0, 1.0));" +
  " gl_FragColor = vec4(c.rgb * 0.25, 1.0); }";

export function createXRCameraFeed(renderer, session, { maxSize = 320 } = {}) {
  const gl = renderer.getContext();
  const gl2 = typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext;
  const vaoExt = gl2 ? null : gl.getExtension("OES_vertex_array_object");
  const bindVAO = gl2 ? function(v){ gl.bindVertexArray(v); } : vaoExt ? function(v){ vaoExt.bindVertexArrayOES(v); } : null;

  /* enabledFeatures: https://immersive-web.github.io/webxr/#dom-xrsession-enabledfeatures (Chrome 111+).
     Without it we cannot know up front, so stay optimistic and decide on the first frames. */
  const granted = session.enabledFeatures ? session.enabledFeatures.indexOf(XR_CAMERA_FEATURE) >= 0 : null;
  const hasApi = typeof XRWebGLBinding !== "undefined" && "getCameraImage" in XRWebGLBinding.prototype;

  const canvas = document.createElement("canvas");
  /* willReadFrequently keeps the canvas on the CPU: we only putImageData into it and MediaPipe only uploads from it */
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const out = { canvas: canvas, width: 0, height: 0 };
  const mat = new Float32Array(4);

  let binding = null, prog = null, uM = null, uD = null, vbo = null, vao = null, fbo = null, tex = null;
  let pixels = null, image = null, w = 0, h = 0, fails = 0, noCamera = 0, checkGL = false, disposed = false;

  const feed = {
    supported: hasApi && granted !== false,
    error: hasApi ? (granted === false ? "camera-access was not granted for this session" : "") : "XRWebGLBinding.getCameraImage is missing",
    /* Calibration knobs, all applied on top of the documented behaviour (image aligned with the view, texture
       origin bottom-left). Leave at defaults unless the phone shows otherwise; they only change the canvas, so
       imageToNDC stays valid. rotate = number of clockwise quarter turns applied to the picture. */
    flipX: false, flipY: false, rotate: 0,
    capture: capture,
    syncState: syncState,
    imageToNDC: imageToNDC,
    dispose: dispose
  };
  return feed;

  /* Chrome binds the camera texture behind the page's back at the start of every frame of a camera-access session,
     so three's cached texture binding goes stale and a card can show the camera feed instead of its own map
     (https://github.com/mrdoob/three.js/issues/26452, fixed upstream in r179 by exactly this call:
     https://github.com/mrdoob/three.js/pull/31487). three 0.160 needs it done by hand on every frame where
     capture() is not called; capture() covers it through resetState(). */
  function syncState() {
    if (granted !== false && renderer.state && renderer.state.unbindTexture) renderer.state.unbindTexture();
  }

  function fail(msg) {
    feed.error = msg;
    if (++fails >= 3) feed.supported = false;
    return null;
  }

  function init() {
    binding = new XRWebGLBinding(session, gl);
    const sh = function(type, src) {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error("shader: " + gl.getShaderInfoLog(s));
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "a_p");
    gl.linkProgram(prog);
    gl.deleteShader(vs); gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link: " + gl.getProgramInfoLog(prog));
    uM = gl.getUniformLocation(prog, "u_m"); uD = gl.getUniformLocation(prog, "u_d");
    gl.useProgram(prog); gl.uniform1i(gl.getUniformLocation(prog, "u_t"), 0);

    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);   /* one covering triangle */
    if (bindVAO) {
      /* our own VAO, so three's vertex attribute state is never touched */
      vao = gl2 ? gl.createVertexArray() : vaoExt.createVertexArrayOES();
      bindVAO(vao);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      bindVAO(null);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    fbo = gl.createFramebuffer();
  }

  /* (re)allocate the small render target and the CPU buffers; only runs when the size changes (first frame, rotation) */
  function resize(nw, nh) {
    w = nw; h = nh;
    if (tex) gl.deleteTexture(tex);
    tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error("readback framebuffer incomplete");
    canvas.width = out.width = w; canvas.height = out.height = h;
    image = ctx.createImageData(w, h);
    pixels = new Uint8Array(image.data.buffer);   /* readPixels writes straight into the ImageData, no copy */
    checkGL = true;
  }

  function capture(frame, refSpace) {
    if (!feed.supported || disposed || !frame) return null;
    let touched = false, rt = null;
    try {
      if (gl.isContextLost()) return null;
      const pose = frame.getViewerPose(refSpace);
      if (!pose) return null;
      /* on a phone there is one view and it carries the camera:
         https://github.com/immersive-web/raw-camera-access/blob/main/explainer.md */
      let cam = null;
      for (let i = 0; i < pose.views.length && !cam; i++) cam = pose.views[i].camera;
      if (!cam) {
        /* a granted session can have a few empty frames while ARCore warms up; with no enabledFeatures to ask,
           a second of nothing means the feature is off */
        if (granted === null && ++noCamera > 60) { feed.supported = false; feed.error = "session has no camera image (camera-access not granted?)"; }
        return null;
      }
      noCamera = 0;

      rt = renderer.getRenderTarget();
      touched = true;
      if (!binding) init();

      /* Opaque texture, only valid inside this callback and never to be kept:
         https://immersive-web.github.io/raw-camera-access/#dom-xrwebglbinding-getcameraimage */
      const camTex = binding.getCameraImage(cam);
      if (!camTex) return null;

      const k = ((Math.round(feed.rotate) % 4) + 4) % 4;
      const s = Math.min(1, maxSize / Math.max(cam.width, cam.height));
      let nw = Math.max(1, Math.round(cam.width * s)), nh = Math.max(1, Math.round(cam.height * s));
      if (k & 1) { const tmp = nw; nw = nh; nh = tmp; }
      if (nw !== w || nh !== h) resize(nw, nh);

      /* uv = 0.5 + 0.5 * M * (screen right, screen up). Identity M is the documented case: the image is aligned
         with the XRView (https://immersive-web.github.io/raw-camera-access/#aligned) and the texture origin is
         bottom-left (comment in Chrome's sample:
         https://source.chromium.org/chromium/chromium/src/+/main:third_party/webxr_test_pages/webxr-samples/proposals/camera-access-barebones.html).
         M = Rccw(k * 90deg) * diag(fx, fy), column-major. */
      const c = COS[k], sn = COS[(k + 3) % 4], fx = feed.flipX ? -1 : 1, fy = feed.flipY ? -1 : 1;
      mat[0] = c * fx; mat[1] = sn * fx; mat[2] = -sn * fy; mat[3] = c * fy;

      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, w, h);
      gl.disable(gl.BLEND); gl.disable(gl.DEPTH_TEST); gl.disable(gl.SCISSOR_TEST); gl.disable(gl.STENCIL_TEST); gl.disable(gl.CULL_FACE);
      gl.colorMask(true, true, true, true);
      gl.useProgram(prog);
      gl.uniformMatrix2fv(uM, false, mat);
      gl.uniform2f(uD, 0.5 / w, 0.5 / h);   /* a quarter of an output pixel, in clip units */
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, camTex);

      let attr0 = false;
      if (bindVAO) bindVAO(vao);
      else {
        /* WebGL1 with no VAO extension: borrow attribute 0 and hand it back as found, three tracks it itself */
        attr0 = gl.getVertexAttrib(0, gl.VERTEX_ATTRIB_ARRAY_ENABLED);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      }
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (bindVAO) bindVAO(null);
      else { if (!attr0) gl.disableVertexAttribArray(0); gl.bindBuffer(gl.ARRAY_BUFFER, null); }
      gl.bindTexture(gl.TEXTURE_2D, null);

      if (gl2) gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
      /* ponytail: synchronous readback of about 320x150 px. If it shows up as a stall in the Debug frame time,
         move to a PIXEL_PACK_BUFFER + fenceSync (WebGL2) at the cost of one frame of latency. */
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      if (checkGL) {   /* getError is a round trip to the GPU process, so only after a (re)allocation */
        checkGL = false;
        const e = gl.getError();
        if (e) { checkGL = true; throw new Error("WebGL error 0x" + e.toString(16) + " reading the camera image"); }
      }
      ctx.putImageData(image, 0, 0);
      fails = 0;
      return out;
    } catch (e) {
      return fail(e && e.message ? e.message : String(e));
    } finally {
      if (touched) restore(rt);
    }
  }

  /* resetState() drops every cached binding in three AND forgets the current render target (it binds framebuffer
     null and sets _currentRenderTarget = null, three r160 WebGLRenderer.resetState / WebGLState.reset). The XR
     manager only binds the session framebuffer once per frame, before our callback, so we must put it back or
     the frame renders into nothing. */
  function restore(rt) {
    try {
      renderer.resetState();
      if (rt) renderer.setRenderTarget(rt);
      else {
        const base = session.renderState && session.renderState.baseLayer;
        if (base) gl.bindFramebuffer(gl.FRAMEBUFFER, base.framebuffer);
      }
    } catch (e) { feed.error = e && e.message ? e.message : String(e); }
  }

  /* The camera image is "aligned" with its XRView: same pose and the same frustum shape, Chrome crops the sensor
     image to make that true (https://immersive-web.github.io/raw-camera-access/#aligned). So the full image is the
     full view rectangle, whatever the two resolutions are and wherever the principal point sits: the off-centre
     terms live in view.projectionMatrix, which the raycaster already applies when it unprojects NDC. That leaves
     only the change of convention from image coords (origin top-left, v down) to NDC (-1..1, y up).
     Raycast with renderer.xr.getCamera().cameras[0]: in three 0.160 only that camera gets a fresh
     projectionMatrixInverse in AR (WebXRManager.onAnimationFrame); the ArrayCamera and the user camera do not. */
  function imageToNDC(u, v) {
    return { x: u * 2 - 1, y: 1 - v * 2 };
  }

  function dispose() {
    if (disposed) return;
    disposed = true; feed.supported = false;
    try {
      if (tex) gl.deleteTexture(tex);
      if (fbo) gl.deleteFramebuffer(fbo);
      if (vbo) gl.deleteBuffer(vbo);
      if (prog) gl.deleteProgram(prog);
      if (vao) { if (gl2) gl.deleteVertexArray(vao); else vaoExt.deleteVertexArrayOES(vao); }
    } catch (e) { /* context already gone with the session */ }
    binding = prog = vbo = vao = fbo = tex = pixels = image = null;
    canvas.width = canvas.height = 0;
  }
}
