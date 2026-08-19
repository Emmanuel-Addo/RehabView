const TrustedBrand = ({ darkMode }) => {
    const partners = [
        "Google Earth Engine",
        "Sentinel-2 / ESA",
        "CERSGIS",
        "Ghana Stat. Service",
        "University of Ghana",
        "NASA Earthdata",
        "Copernicus",
    ];

    return (
        <div className="w-full mt-12 mb-8">
            <h3 className={`text-xs text-center uppercase tracking-widest font-semibold mb-6 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Powered by scientific data partners —
            </h3>

            <div className="overflow-hidden w-full relative max-w-5xl mx-auto select-none">
                {/* Left fade */}
                <div className={`absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r ${darkMode ? "from-gray-950" : "from-white"} to-transparent`} />

                {/* Marquee Row */}
                <div className="flex animate-marquee-brands flex-row flex-nowrap w-max py-2 items-center">
                    {[...partners, ...partners, ...partners].map((partner, index) => (
                        <span
                            key={`${partner}-${index}`}
                            className={`mx-8 text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                                darkMode
                                    ? "text-gray-500 hover:text-gray-300"
                                    : "text-gray-400 hover:text-gray-600"
                            }`}
                            draggable={false}
                        >
                            {partner}
                        </span>
                    ))}
                </div>

                {/* Right fade */}
                <div className={`absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l ${darkMode ? "from-gray-950" : "from-white"} to-transparent`} />
            </div>
        </div>
    );
}

export default TrustedBrand;