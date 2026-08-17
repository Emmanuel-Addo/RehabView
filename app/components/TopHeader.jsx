import { MapPin, Calendar, HelpCircle, Info } from 'lucide-react';

export const TopHeader = ({ selectedYear, selectedRegion, selectedDistrict, onTour, onAbout }) => {
    const scopeLabel = selectedDistrict || selectedRegion || null;

    return (
        <header className="absolute left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-white/8 bg-[#0a1628]/94 px-4 shadow-[0_12px_32px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-3">
                <div>
                    <h1 className="font-display text-[1.05rem] font-medium leading-none text-[#f3efe4]">
                        Rehab<span className="text-brand-gold">Pulse</span>
                    </h1>
                    <p className="mt-0.5 text-[9px] font-medium tracking-[0.02em] text-white/38">
                        Mine Rehabilitation Monitoring
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {(selectedYear || scopeLabel) && (
                    <div className="hidden items-center gap-2 sm:flex">
                        {selectedYear && (
                            <div className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.025] px-3 py-1.5">
                                <Calendar size={11} className="text-white/40" />
                                <span className="font-mono text-[10px] font-medium text-white/72">
                                    {selectedYear}
                                </span>
                            </div>
                        )}
                        {scopeLabel && (
                            <div className="flex max-w-[220px] items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.025] px-3 py-1.5">
                                <MapPin size={11} className="shrink-0 text-white/40" />
                                <span className="truncate text-[10px] font-medium text-white/72">
                                    {scopeLabel}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {onTour && (
                    <button
                        onClick={onTour}
                        title="Help"
                        className="hidden items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-white/35 transition-all duration-200 hover:border-white/18 hover:text-white/70 md:flex md:px-3"
                    >
                        <HelpCircle size={11} />
                        <span className="hidden text-[9px] font-medium sm:block">Help</span>
                    </button>
                )}

                {onAbout && (
                    <button
                        onClick={onAbout}
                        title="About this portal"
                        className="flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-white/35 transition-all duration-200 hover:border-brand-gold/30 hover:text-[#6ee7b7] sm:px-3"
                    >
                        <Info size={11} />
                        <span className="hidden text-[9px] font-medium sm:block">About</span>
                    </button>
                )}
            </div>
        </header>
    );
};
