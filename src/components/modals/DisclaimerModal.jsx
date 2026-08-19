"use client";

import { useEffect } from 'react';
import { Info } from 'lucide-react';

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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-[6px] transition-opacity duration-200" />

            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-700 bg-neutral-950 shadow-[0_32px_80px_rgba(0,0,0,0.9)] transition-all duration-200">

                {/* Header */}
                <div className="flex items-center gap-4 border-b border-neutral-800 px-7 py-6">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-600 bg-neutral-800">
                        <Info size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-display text-xl leading-none text-white font-semibold tracking-tight">Disclaimer</h2>
                        <p className="mt-1.5 text-sm text-neutral-400">Please read before using this portal</p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-7 py-7 space-y-5">
                    <p className="text-base leading-relaxed text-neutral-200">
                        RehabView is powered by Google Earth Engine and Sentinel-2 satellite data. All NDVI estimates are approximations of vegetation health.
                    </p>
                    <p className="text-sm leading-relaxed text-neutral-400">
                        This data is for research and informational purposes only. It should not be used as the sole basis for regulatory, legal, or planning decisions.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-neutral-800 px-7 py-5">
                    <p className="text-sm text-neutral-500">This notice will not show again.</p>
                    <button
                        onClick={onAccept}
                        className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 cursor-pointer"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
