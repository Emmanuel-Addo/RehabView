"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/home/HeroSection";
import BuildProcess from "@/components/home/Building-process";
import OurTestimonials from "@/components/home/Our-Testimonails";
import Footer from "@/components/home/Footer";
import ImageGallery from "@/components/home/ImageGallery";
import FAQSections from "@/components/home/FAQSections";
import CallToAction from "@/components/home/CallToAction";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const prevBg = document.body.style.background;
    document.body.style.background = darkMode ? "#030712" : "#ffffff";
    return () => {
      document.body.style.background = prevBg;
    };
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"} flex flex-col`}>

      {/* Hero */}
      <div className="w-full">
        <HeroSection darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>

      <BuildProcess/>

      <ImageGallery/>

      <CallToAction/>

      <OurTestimonials/>

      <FAQSections/>
      
      <Footer/>

    
    </div>
  );
}
