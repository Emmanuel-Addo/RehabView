import { X, Layers } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel.jsx';

const ALL_LEGEND_ITEMS = [
    {
        id: 'ndvi',
        label: 'Vegetation Health (NDVI)',
        desc: 'Bare soil to dense vegetation',
        gradient: 'linear-gradient(90deg,#8B4513 0%,#D2691E 24%,#9ACD32 52%,#228B22 78%,#006400 100%)',
        lowLabel: 'Bare soil',
        highLabel: 'Dense vegetation',
    },
    {
        id: 'region',
        swatch: 'border-2 border-white/80 bg-transparent',
        label: 'Region',
        desc: 'Administrative boundary',
    },
    {
        id: 'district',
        swatch: 'border-2 border-cyan-400 bg-transparent',
        label: 'District',
        desc: 'District boundary',
    },
];

export const LegendPanel = ({ isOpen, onClose, activeLayers = [], className = '' }) => {
    if (!isOpen) return null;

    const visibleItems = ALL_LEGEND_ITEMS.filter(item => activeLayers.includes(item.id));

    return (
        <div className={`z-50 ${className}`}>
            <GlassPanel className="min-w-[220px] rounded-xl">
                <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Layers size={12} className="text-brand-gold/60" />
                        <span className="text-[10px] font-medium text-white/72">
                            Active layers
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded p-1 text-white/30 transition-all hover:bg-white/6 hover:text-white/70"
                    >
                        <X size={12} />
                    </button>
                </div>

                <div className="flex flex-col gap-3 px-4 py-3">
                    {visibleItems.length === 0 ? (
                        <p className="py-2 text-center text-[10px] font-medium text-white/34">
                            No active layers
                        </p>
                    ) : (
                        visibleItems.map(item => (
                            <div key={item.id} className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                    {item.gradient ? (
                                        <div className="w-full min-w-0">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-medium leading-none text-white/78">
                                                        {item.label}
                                                    </span>
                                                    <span className="mt-0.5 text-[9px] text-white/38">
                                                        {item.desc}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2">
                                                <div
                                                    className="h-2.5 w-full rounded-full border border-white/10"
                                                    style={{ background: item.gradient }}
                                                />
                                                <div className="mt-1 flex items-center justify-between text-[8px] uppercase tracking-[0.08em] text-white/34">
                                                    <span>{item.lowLabel}</span>
                                                    <span>{item.highLabel}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`h-4 w-4 shrink-0 rounded-sm ${item.swatch}`} />
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-medium leading-none text-white/78">
                                                    {item.label}
                                                </span>
                                                <span className="mt-0.5 text-[9px] text-white/38">
                                                    {item.desc}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </GlassPanel>
        </div>
    );
};

