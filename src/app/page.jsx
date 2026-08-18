"use client";

import { useState, useEffect } from "react";
import HeroSection from "@/components/home/HeroSection";

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
      <div className="w-full max-w-5xl mx-auto">
        <HeroSection darkMode={darkMode} setDarkMode={setDarkMode} />
      </div>

    
    </div>
  );
}
