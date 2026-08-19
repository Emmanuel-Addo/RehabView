"use client";

import { useEffect } from 'react';
import { X, Play, TreePine, ScanSearch, Database } from 'lucide-react';

export function AboutModal({ isOpen = false, onClose, onOpenTour, canOpenTour = true }) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event) => { if (event.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/65 backdrop-blur-[6px] transition-opacity duration-200 opacity-100" onClick={onClose} />

            <div
                className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.75)] backdrop-blur-xl transition-all duration-200 ease-out opacity-100 translate-y-0 scale-100"
                style={{ background: 'linear-gradient(180deg,rgba(4,5,7,0.94)0%,rgba(2,3,5,0.97)100%)', border: '1px solid rgba(243,239,228,0.10)' }}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-white/8 px-7 pb-5 pt-6">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="font-display text-2xl font-semibold leading-none text-[#f3efe4]">
                                Rehab<span className="text-brand-gold">Pulse</span> Ghana
                            </h2>
                            <p className="mt-2 text-sm text-white/50">NDVI Vegetation Monitoring Portal</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white/80" aria-label="Close">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-7 py-6 space-y-5">
                    <p className="text-base leading-relaxed text-white/75">
                        RehabPulse Ghana monitors vegetation health using NDVI across regions and districts in Ghana, powered by Sentinel-2 satellite imagery from 2020 to 2025.
                    </p>

                    <div className="space-y-3.5 border-t border-white/6 pt-5">
                        <p className="text-xs font-bold tracking-[0.12em] text-white/35 uppercase mb-4">How to use</p>
                        <div className="flex items-start gap-3.5">
                            <ScanSearch size={15} className="mt-0.5 shrink-0 text-brand-gold/80" />
                            <p className="text-sm leading-relaxed text-white/60">Select a region or district, choose a year, then run the analysis.</p>
                        </div>
                        <div className="flex items-start gap-3.5">
                            <TreePine size={15} className="mt-0.5 shrink-0 text-brand-gold/80" />
                            <p className="text-sm leading-relaxed text-white/60">Toggle the NDVI and rehabilitation status layers. Hover over a district to see its name, or click to zoom in.</p>
                        </div>
                        <div className="flex items-start gap-3.5">
                            <Database size={15} className="mt-0.5 shrink-0 text-brand-gold/80" />
                            <p className="text-sm leading-relaxed text-white/60">All values are estimates intended for planning, screening, and research.</p>
                        </div>
                    </div>

                    <div className="space-y-3 border-t border-white/6 pt-5">
                        <p className="text-xs font-bold tracking-[0.12em] text-white/35 uppercase mb-4">Data sources</p>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-semibold text-white/75">Vegetation health (NDVI)</p>
                                <p className="mt-1 text-sm leading-relaxed text-white/50">Derived from Sentinel-2 satellite imagery via Google Earth Engine.</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white/75">Mining footprints</p>
                                <p className="mt-1 text-sm leading-relaxed text-white/50">Provided by CERSGIS, University of Ghana.</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white/75">Boundaries</p>
                                <p className="mt-1 text-sm leading-relaxed text-white/50">Region and district boundaries from Ghana Statistical Service (GSS).</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3 border-t border-white/8 px-7 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        {canOpenTour ? (
                            <button onClick={onOpenTour} className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/65 transition-colors hover:bg-white/6 hover:text-white">
                                <Play size={12} /> Quick tour
                            </button>
                        ) : (
                            <span className="text-sm text-white/30">Tour available on desktop.</span>
                        )}
                    </div>
                    <button onClick={onClose} className="rounded-lg bg-[#10b981] px-6 py-2.5 text-sm font-semibold text-[#0a1628] transition-colors hover:bg-[#34d399]">
                        Start exploring
                    </button>
                </div>
            </div>
        </div>
    );
}
