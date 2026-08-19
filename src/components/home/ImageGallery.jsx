"use client"
import { useState } from "react";

const ImageGallery = () => {
    const [stopScroll, setStopScroll] = useState(false);
    const cardData = [
        {
            title: "Lush Forest Reserve, Ghana",
            image: "https://images.unsplash.com/photo-1574786199452-c7a5f69fb6e9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGxhbmRzYXR8ZW58MHx8MHx8fDA%3D",
        },
        {
            title: "Aerial Green Canopy",
            image: "https://images.unsplash.com/photo-1576767969134-4318b9bd84a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGFuZHNhdHxlbnwwfHwwfHx8MA%3D%3D",
        },
        {
            title: "West African Savanna",
            image: "https://images.unsplash.com/photo-1578309992775-ca77477765ce?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bGFuZHNhdHxlbnwwfHwwfHx8MA%3D%3D",
        },
        {
            title: "River Through the Forest",
            image: "https://images.unsplash.com/photo-1578309756587-17d044170748?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGxhbmRzYXR8ZW58MHx8MHx8fDA%3D",
        },
        {
            title: "Tropical Rainforest Path",
            image: "https://images.unsplash.com/photo-1578309755679-1ce69ac9dcb5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGxhbmRzYXR8ZW58MHx8MHx8fDA%3D",
        },
        {
            title: "Golden Savanna at Dusk",
            image: "https://images.unsplash.com/photo-1578309756431-566fa58d6f2c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxhbmRzYXR8ZW58MHx8MHx8fDA%3D",
        },
        {
            title: "Dense Vegetation Cover",
            image: "https://images.unsplash.com/photo-1578309744318-e418e8bd1b4e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bGFuZHNhdHxlbnwwfHwwfHx8MA%3D%3D",
        },
        {
            title: "Morning Mist Over Trees",
            image: "https://images.unsplash.com/photo-1578589302571-90c75cb58046?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxhbmRzYXR8ZW58MHx8MHx8fDA%3D",
        },
    ];

    return (
        <>
            <style>{`
                .marquee-inner {
                    animation: marqueeScroll linear infinite;
                }
                @keyframes marqueeScroll {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>

            {/* Section Header */}
            <div className="w-full max-w-6xl mx-auto text-center mb-10 px-4 mt-16">
                <p className="text-sm font-semibold text-black uppercase tracking-widest mb-2">Visual Insights</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                    Landscapes We Monitor
                </h2>
                <p className="text-gray-500 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
                    We track vegetation health and land cover changes across Ghana&apos;s forests, savannas, and ecological zones using satellite-powered NDVI analysis.
                </p>
            </div>

            {/* Marquee Gallery */}
            <div className="overflow-hidden w-full relative max-w-6xl mx-auto" onMouseEnter={() => setStopScroll(true)} onMouseLeave={() => setStopScroll(false)}>
                <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
                <div className="marquee-inner flex w-fit" style={{ animationPlayState: stopScroll ? "paused" : "running", animationDuration: cardData.length * 2500 + "ms" }}>
                    <div className="flex">
                        {[...cardData, ...cardData].map((card, index) => (
                            <div key={index} className="w-64 mx-4 h-[23rem] relative group hover:scale-90 transition-all duration-300 border border-gray-200 rounded-xl overflow-hidden bg-white">
                                <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                                <div className="flex items-center justify-center px-4 opacity-0 group-hover:opacity-100 transition-all duration-300 absolute bottom-0 backdrop-blur-md left-0 w-full h-full bg-black/20">
                                    <p className="text-white text-lg font-semibold text-center">{card.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
            </div>
        </>
    );
};

export default ImageGallery;