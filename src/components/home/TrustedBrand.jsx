const TrustedBrand = ({ darkMode }) => {
    const companyLogos = ["slack", "framer", "netflix", "google", "linkedin", "instagram", "facebook"];
    
    return (
        <div className="w-full mt-12 mb-8">
            <h3 className={`text-xs text-center uppercase tracking-widest font-semibold mb-6 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
                Trusted by leading brands, including —
            </h3>
            
            <div className="overflow-hidden w-full relative max-w-5xl mx-auto select-none">
                {/* Left side gradient overlay */}
                <div className={`absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r ${darkMode ? "from-gray-950" : "from-white"} to-transparent`} />

                {/* Marquee Row */}
                <div className="flex animate-marquee-brands flex-row flex-nowrap w-max py-2 items-center">
                    {[...companyLogos, ...companyLogos, ...companyLogos].map((company, index) => (
                        <img 
                            key={`${company}-${index}`} 
                            src={`https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/companyLogo/${company}.svg`}
                            alt={company} 
                            className={`h-11 w-auto mx-8 object-contain transition-all duration-300 ${
                                darkMode 
                                    ? "brightness-0 invert opacity-25 hover:opacity-50" 
                                    : "brightness-0 opacity-25 hover:opacity-50"
                            }`} 
                            draggable={false} 
                        />
                    ))}
                </div>

                {/* Right side gradient overlay */}
                <div className={`absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l ${darkMode ? "from-gray-950" : "from-white"} to-transparent`} />
            </div>
        </div>
    );
}

export default TrustedBrand;