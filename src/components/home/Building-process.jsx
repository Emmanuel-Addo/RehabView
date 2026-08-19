"use client";

import { useEffect, useRef, useState } from "react";

const leftSteps = [
    {
        title: "Retrieve Satellite Imagery",
        description:
            "Our platform queries historical Sentinel-2 and Landsat satellite data, automatically filtering for cloud-free observations across your selected boundaries.",
    },
    {
        title: "Analyze Trends & Export",
        description:
            "Visualize annual NDVI vegetation index changes from 2020 to 2025 on interactive charts, detect deforestation or regrowth trends, and export GIS-ready reports.",
    },
];

const rightSteps = [
    {
        title: "Choose Region or District",
        description:
            "Select any region or district in Ghana. The system automatically retrieves the geographical boundary coordinates and sets up the area of interest.",
    },
    {
        title: "Calculate NDVI Metrics",
        description:
            "The system processes the near-infrared and red bands of the satellite imagery to calculate the Normalized Difference Vegetation Index (NDVI) dynamically.",
    },
];

export default function BuildProcess() {
    const segmentRefs = useRef([]);
    const [progress, setProgress] = useState([0, 0, 0]);

    useEffect(() => {
        const handleScroll = () => {
            const updated = segmentRefs.current.map((el) => {
                if (!el) return 0;

                const rect = el.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                const start = windowHeight * 0.6;
                const end = windowHeight * 0.2;

                let percent = (start - rect.top) / (start - end);

                percent = Math.min(Math.max(percent, 0), 1);

                return percent;
            });

            setProgress(updated);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section id="process" className="flex flex-col items-center mt-32">
            <p className="font-domine">Simple 4-Step Analysis</p>

            <h3 className="text-3xl max-w-sm text-gray-500 text-center mt-5">
                Monitor Vegetation Health in Four Simple Steps
            </h3>

            <div className="flex flex-col md:flex-row mt-20 md:mt-32">
                <div>
                    {leftSteps.map((step, index) => (
                        <div key={index} className="max-w-lg h-60 md:mt-60">
                            <h3 className="text-xl underline font-domine">{step.title}</h3>
                            <p className="mt-6 text-gray-500 text-sm/6">{step.description}</p>
                        </div>
                    ))}
                </div>

                <div className="hidden md:flex flex-col items-center">
                    <div className="size-4 bg-gray-800" />

                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div ref={(el) => { if (el) segmentRefs.current[i] = el; }} data-index={i} className="relative w-0.5 mx-10 h-60 bg-gray-300 overflow-hidden" >
                                <div style={{ height: `${progress[i] * 100}%` }} className="absolute top-0 left-0 w-full bg-gray-800" />
                            </div>
                            <div className={`size-4 ${progress[i] > 0.95 ? "bg-gray-800" : "bg-gray-300"}`} />
                        </div>
                    ))}
                </div>

                <div>
                    {rightSteps.map((step, index) => (
                        <div key={index} className={`max-w-lg h-60 ${index === 0 ? "" : "md:mt-60"}`} >
                            <h3 className="text-xl underline font-domine">{step.title}</h3>
                            <p className="mt-6 text-gray-500 text-sm/6">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}