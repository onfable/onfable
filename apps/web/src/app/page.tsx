import { Channels } from "@/components/channels";
import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { InstallTabs } from "@/components/install-tabs";
import { Nav } from "@/components/nav";
import { TerminalDemo } from "@/components/terminal-demo";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TerminalDemo />
        <InstallTabs />
        <Features />
        <HowItWorks />
        <Channels />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
