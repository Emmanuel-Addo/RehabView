"use client";

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

export function DisclaimerModal({ isOpen = false, onAccept }) {
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => { if (e.key === 'Enter') onAccept?.(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onAccept]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/72 backdrop-blur-[6px] transition-opacity duration-200 opacity-100" />

            <div
                className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.72)] transition-all duration-200 ease-out opacity-100 translate-y-0 scale-100"
                style={{ background: 'linear-gradient(180deg,rgba(4,5,7,0.96)0%,rgba(2,3,5,0.99)100%)', border: '1px solid rgba(243,239,228,0.08)' }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-white/8 px-6 py-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-gold/20 bg-brand-gold/8">
                        <AlertTriangle size={15} className="text-brand-gold/80" />
                    </div>
                    <div>
                        <h2 className="font-display text-[1.1rem] leading-none text-[#f3efe4]">Data Disclaimer</h2>
                        <p className="mt-1 text-[10px] text-white/36">Please read before using this portal</p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-4">
                    <p className="text-[12px] leading-relaxed text-white/72">
                        RehabView Ghana is based on satellite imagery and modelled estimates. NDVI values and rehabilitation status should be treated as approximations.
                    </p>
                    <div className="space-y-2">
                        <p className="text-[11px] leading-relaxed text-white/48"><span className="mr-2 font-semibold text-brand-gold/50">1.</span>Results may contain misclassification, cloud artefacts, and temporal gaps introduced during image processing.</p>
                        <p className="text-[11px] leading-relaxed text-white/48"><span className="mr-2 font-semibold text-brand-gold/50">2.</span>This portal is intended for research, screening, and planning. It should not be used as the sole basis for regulatory, legal, or financial decisions.</p>
                        <p className="text-[11px] leading-relaxed text-white/48"><span className="mr-2 font-semibold text-brand-gold/50">3.</span>Field verification remains essential before drawing operational conclusions from the figures shown here.</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-white/8 px-6 py-4">
                    <p className="text-[10px] text-white/28">This notice will not appear again on this device.</p>
                    <button
                        onClick={onAccept}
                        className="rounded-lg bg-[#10b981] px-6 py-2.5 text-[11px] font-semibold text-[#0a1628] transition-colors hover:bg-[#34d399]"
                    >
                        I understand
                    </button>
                </div>
            </div>
        </div>
    );
}

