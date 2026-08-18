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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-[4px] transition-opacity duration-200" />

            <div
                className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-[0_24px_64px_rgba(0,0,0,0.8)] transition-all duration-200"
            >
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-neutral-800 px-6 py-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900">
                        <Info size={16} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-display text-[1.1rem] leading-none text-white font-medium">Disclaimer</h2>
                        <p className="mt-1 text-[10px] text-neutral-400">Please read before using this portal</p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-4">
                    <p className="text-[12px] leading-relaxed text-neutral-300">
                        RehabView is powered by Google Earth Engine and Sentinel-2 satellite data. All NDVI estimates are approximations of vegetation health.
                    </p>
                    <p className="text-[11px] leading-relaxed text-neutral-400">
                        This data is for research and informational purposes. It should not be used as the sole basis for regulatory, legal, or planning decisions.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-neutral-800 px-6 py-4">
                    <p className="text-[10px] text-neutral-500">This notice will not show again.</p>
                    <button
                        onClick={onAccept}
                        className="rounded-md bg-white px-5 py-2 text-[11px] font-semibold text-black transition-colors hover:bg-neutral-200"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
