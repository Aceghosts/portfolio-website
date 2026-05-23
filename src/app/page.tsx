import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Services } from "@/components/sections/services";
import { Projects } from "@/components/sections/projects";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { ScrollGradient } from "@/components/ui/scroll-gradient";

export default function Home() {
  return (
    <>
      <ScrollGradient />
      <main className="grain relative z-10">
        <Navbar />
        <Hero />
        <About />
        <Services />
        <Projects />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
