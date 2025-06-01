import About from "@/components/landing-page/About";
import HeroSection from "@/components/landing-page/HeroSection";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import HowItWorks from "@/components/landing-page/HowItWorks";
export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <About />
      <HowItWorks />
      <Footer />
    </div>
  );
}
