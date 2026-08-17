"use client";

import { useEffect, useState, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TOUR_KEY = 'rehabpulse_tour_seen';

const STEPS = [
    {
        target: 'tour-setup-panel',
        title: 'Setup panel',
        body: 'Choose a scope, select a place, pick a year, then run the analysis.',
        position: 'right',
    },
    {
        target: 'tour-map',
        title: 'Map workspace',
        body: 'The selected NDVI, rehabilitation status, and boundary layers appear here after you run the analysis.',
        position: 'left',
    },
    {
        target: 'tour-findings-panel',
        title: 'Analysis results panel',
        body: 'This panel summarizes the selected area and shows the trend over time.',
        position: 'left',
    },
];

function getRect(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    return el.getBoundingClientRect();
}

const PAD = 10;

export function TourGuide({ autoStart = false }) {
    const [active, setActive] = useState(false);
    const [step, setStep] = useState(0);
    const [rect, setRect] = useState(null);

    useEffect(() => {
        if (!active) return;
        const update = () => setRect(getRect(STEPS[step].target));
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, [active, step]);

    const finish = useCallback(() => {
        setActive(false);
        localStorage.setItem(TOUR_KEY, 'true');
    }, []);

    const startTour = useCallback(() => {
        setStep(0);
        setActive(true);
    }, []);

    const next = useCallback(() => {
        if (step < STEPS.length - 1) setStep(prev => prev + 1);
        else finish();
    }, [step, finish]);

    const prev = useCallback(() => {
        if (step > 0) setStep(prev => prev - 1);
    }, [step]);

    useEffect(() => {
        if (autoStart > 0) {
            const timeoutId = setTimeout(() => startTour(), 0);
            return () => clearTimeout(timeoutId);
        }
    }, [autoStart, startTour]);

    if (!active || !rect) return null;

    const current = STEPS[step];
    const spotlight = {
        top: rect.top - PAD,
        left: rect.left - PAD,
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
    };

    let tooltip = {};
    const CARD_W = 300;
    const CARD_H = 200;
    const CARD_OFFSET = 16;

    if (current.position === 'right') {
        tooltip = { top: Math.max(8, spotlight.top), left: spotlight.left + spotlight.width + CARD_OFFSET };
    } else {
        tooltip = { top: Math.max(8, spotlight.top), left: spotlight.left - CARD_W - CARD_OFFSET };
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (tooltip.left + CARD_W > vw - 8) tooltip.left = vw - CARD_W - 8;
    if (tooltip.left < 8) tooltip.left = 8;
    if (tooltip.top < 8) tooltip.top = 8;
    if (tooltip.top + CARD_H > vh - 8) tooltip.top = vh - CARD_H - 8;

    return (
        <>
            <div className="fixed inset-0 z-[9000] pointer-events-none">
                <div
                    className="absolute rounded-xl pointer-events-none"
                    style={{
                        top: spotlight.top,
                        left: spotlight.left,
                        width: spotlight.width,
                        height: spotlight.height,
                        boxShadow: '0 0 0 9999px rgba(0,0,0,0.66)',
                        transition: 'top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease',
                    }}
                />
            </div>

            <div className="fixed inset-0 z-[9000]" onClick={finish} />

            <div
                className="fixed z-[9100] pointer-events-auto"
                style={{ top: tooltip.top, left: tooltip.left, width: CARD_W }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="overflow-hidden rounded-2xl shadow-2xl backdrop-blur-xl" style={{ background: 'linear-gradient(180deg,rgba(4,5,7,0.92)0%,rgba(2,3,5,0.96)100%)', border: '1px solid rgba(243,239,228,0.08)' }}>
                    <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex gap-1">
                                {STEPS.map((_, i) => (
                                    <div key={i} className={`rounded-full transition-all ${i === step ? 'h-1.5 w-4 bg-[#10b981]' : i < step ? 'h-1.5 w-1.5 bg-[#10b981]/50' : 'h-1.5 w-1.5 bg-white/12'}`} />
                                ))}
                            </div>
                            <span className="text-[9px] text-white/28">{step + 1} of {STEPS.length}</span>
                        </div>
                        <button onClick={finish} className="rounded p-1 text-white/28 transition-colors hover:bg-white/6 hover:text-white/58">
                            <X size={13} />
                        </button>
                    </div>

                    <div className="px-4 py-4">
                        <h3 className="font-display text-[1.05rem] text-[#f3efe4]">{current.title}</h3>
                        <p className="mt-2 text-[11px] leading-relaxed text-white/48">{current.body}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/8 px-4 py-3">
                        <button onClick={finish} className="text-[9px] text-white/28 transition-colors hover:text-white/46">Skip</button>
                        <div className="flex items-center gap-2">
                            {step > 0 ? (
                                <button onClick={prev} className="flex items-center gap-1 rounded border border-white/10 px-3 py-1.5 text-[10px] text-white/54 transition-colors hover:bg-white/6 hover:text-white">
                                    <ChevronLeft size={12} />
                                    Back
                                </button>
                            ) : null}
                            <button onClick={next} className="flex items-center gap-1 rounded bg-[#10b981] px-4 py-1.5 text-[10px] font-semibold text-[#0a1628] transition-colors hover:bg-[#34d399]">
                                {step === STEPS.length - 1 ? 'Done' : 'Next'}
                                {step < STEPS.length - 1 ? <ChevronRight size={12} /> : null}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
