"use client"
import { useState } from "react";

const FAQSections = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const faqsData = [
        {
            question: "What is RehabPulse and what does it do?",
            answer: "RehabPulse is a satellite-powered vegetation health monitoring platform. It uses Sentinel-2 and Landsat imagery to compute NDVI (Normalized Difference Vegetation Index) values across regions in Ghana, helping researchers, planners, and policymakers track land cover changes, deforestation, and regrowth trends over time."
        },
        {
            question: "What does NDVI mean and why does it matter?",
            answer: "NDVI stands for Normalized Difference Vegetation Index. It is a numerical measure derived from satellite imagery that indicates the density and health of vegetation. Values close to +1.0 indicate lush, healthy greenery, while values near 0 or below suggest bare soil, water, or urbanized areas. It is a key tool for monitoring ecosystem health."
        },
        {
            question: "Which satellite data sources does RehabPulse use?",
            answer: "RehabPulse primarily uses Sentinel-2 and Landsat 8/9 multispectral satellite imagery sourced through the Google Earth Engine API. These datasets provide historical and near-real-time coverage with sufficient spatial resolution for regional vegetation analysis across Ghana."
        },
        {
            question: "Which regions in Ghana can I monitor?",
            answer: "RehabPulse supports all 16 administrative regions of Ghana. You can select a specific district or region of interest and view NDVI trends, seasonal variations, and year-on-year comparisons from 2020 to 2025."
        },
        {
            question: "Can I export the vegetation data or reports?",
            answer: "Yes. RehabPulse allows you to export NDVI charts, trend summaries, and GIS-ready data files. These can be used in further spatial analysis workflows or submitted as part of environmental impact assessments and research publications."
        },
        {
            question: "How accurate is the vegetation health data?",
            answer: "The accuracy of NDVI-based vegetation analysis depends on cloud cover and satellite overpass frequency. RehabPulse applies cloud masking and composite averaging techniques to improve data quality, providing reliable trend analysis even in regions with frequent cloud cover."
        },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                * { font-family: 'Poppins', sans-serif; }
            `}</style>

            <div className="flex flex-col items-center text-center text-slate-800 px-3 py-16">
                <p className="text-base font-medium text-slate-600">FAQ</p>
                <h2 className="text-3xl md:text-4xl font-semibold mt-2">Frequently Asked Questions</h2>
                <p className="text-sm text-slate-500 mt-4 max-w-md">
                    Everything you need to know about how RehabPulse monitors vegetation health and land cover changes across Ghana.
                </p>

                <div className="max-w-2xl w-full mt-8 flex flex-col gap-4 items-start text-left">
                    {faqsData.map((faq, index) => (
                        <div key={index} className="flex flex-col items-start w-full">
                            <div
                                className="flex items-center justify-between w-full cursor-pointer bg-slate-50 border border-slate-200 p-4 rounded-lg"
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                <h3 className="text-sm font-medium pr-4">{faq.question}</h3>
                                <svg
                                    width="18" height="18" viewBox="0 0 18 18" fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`shrink-0 ${openIndex === index ? "rotate-180" : ""} transition-all duration-500 ease-in-out`}
                                >
                                    <path d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2" stroke="#1D293D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className={`text-sm text-slate-500 px-4 transition-all duration-500 ease-in-out ${openIndex === index ? "opacity-100 max-h-[300px] translate-y-0 pt-4" : "opacity-0 max-h-0 -translate-y-2"}`}>
                                {faq.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default FAQSections;