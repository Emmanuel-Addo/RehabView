const OurTestimonials = () => {
    const testimonials = [
        { text: "RehabView has made monitoring vegetation health and drought trends across the Northern Region incredibly fast. The historical 2020-2025 NDVI datasets are invaluable.", name: "Dr. Emmanuel Mensah", role: "Agricultural Researcher", image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200" },
        { text: "Being able to instantly analyze the annual NDVI scores for any district in Ghana saves our GIS team weeks of manual satellite data retrieval and preprocessing.", name: "Anita Osei", role: "GIS Analyst", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" },
        { text: "The yearly trend charts and cloud-free satellite data filters make tracking local reforestation and land reclamation progress extremely reliable and fast.", name: "Kwabena Boateng", role: "Environmental Officer", image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60" },
        { text: "An excellent open tool for environmental impact assessment. The ease of access to cleaned, localized vegetation index metrics helps our research advocacy immensely.", name: "Prof. Grace Addo", role: "Climate Scientist", image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60" },
        { text: "RehabView simplifies satellite-based crop monitoring. The interface is intuitive, and the yearly district comparisons are perfectly structured for spatial planners.", name: "Kofi Mensah", role: "Spatial Planner", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&h=100&auto=format&fit=crop" },
        { text: "Perfect tool for verifying reforestation project success in the Volta region. The annual NDVI trend tracking is highly accurate and easy to present to stakeholders.", name: "Sarah Lawson", role: "NGO Coordinator", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200" }
    ];

    const rows = [
        { start: 0, end: 3, className: "animate-scroll" },
        { start: 3, end: 6, className: "animate-scroll-reverse" }
    ];

    const renderCard = (testimonial, index) => (
        <div key={index} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shrink-0 w-[350px]">
            <div className="flex mb-4">
                {Array(5).fill(0).map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star text-transparent fill-[#737373]" aria-hidden="true"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path></svg>
                ))}
            </div>
            <p className="text-neutral-700 text-sm mb-6">{testimonial.text}</p>
            <div className="flex items-center gap-3">
                <img src={testimonial.image} alt={testimonial.name} className="w-11 h-11 rounded-full object-cover"/>
                <div>
                    <p className="font-medium text-neutral-800 text-sm">{testimonial.name}</p>
                    <p className="text-neutral-600 text-sm">{testimonial.role}</p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
                    *{
                        font-family: "Geist", sans-serif;
                    }

                    @keyframes scroll {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-50%);
                        }
                    }
                    @keyframes scrollReverse {
                        0% {
                            transform: translateX(-50%);
                        }
                        100% {
                            transform: translateX(0);
                        }
                    }
                    .animate-scroll {
                        animation: scroll 15s linear infinite;
                    }
                    .animate-scroll-reverse {
                        animation: scrollReverse 15s linear infinite;
                    }
                `}
            </style>
            <section className="bg-[#FAFAFA] py-16 px-4">
                <div className="max-w-6xl mx-auto">

                    <div className="text-center mb-8">
                        <div className="inline-block bg-neutral-100 border border-neutral-400 rounded-full px-4 py-1 mb-3">
                            <span className="text-xs text-neutral-600">Loved by researchers</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium text-neutral-900 mb-4">
                            What people are saying
                        </h2>
                        <p className="text-neutral-600 text-sm max-w-96 mx-auto">
                            Hear from GIS professionals, agricultural planners, and scientists leveraging RehabView across Ghana.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-28 bg-linear-to-r from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-28 bg-linear-to-l from-[#FAFAFA] to-transparent z-10 pointer-events-none"></div>

                                <div className={`flex gap-6 ${row.className}`}>
                                    {[...testimonials.slice(row.start, row.end), ...testimonials.slice(row.start, row.end)].map((testimonial, index) =>
                                        renderCard(testimonial, index)
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

export default OurTestimonials