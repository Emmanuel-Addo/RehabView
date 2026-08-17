"use client";

import { useEffect, useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const INITIAL = { name: '', email: '', organisation: '', dataRequested: '', intendedUse: '' };

export function RequestDataModal({ isOpen = false, onClose }) {
    const [form, setForm] = useState(INITIAL);
    const [status, setStatus] = useState('idle'); // idle | sending | success | error

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            setStatus(res.ok ? 'success' : 'error');
        } catch {
            setStatus('error');
        }
    };

    const inputClass = "w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2.5 text-[12px] text-white/88 placeholder-white/24 outline-none transition-colors focus:border-brand-gold/40 focus:bg-white/6";
    const labelClass = "mb-1.5 block text-[10px] font-semibold tracking-[0.08em] text-white/46 uppercase";

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/62 backdrop-blur-[4px] transition-opacity duration-200 opacity-100" onClick={onClose} />

            <div
                className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.68)] backdrop-blur-xl transition-all duration-200 ease-out opacity-100 translate-y-0 scale-100"
                style={{ background: 'linear-gradient(180deg,rgba(4,5,7,0.92)0%,rgba(2,3,5,0.96)100%)', border: '1px solid rgba(243,239,228,0.08)' }}
            >
                <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 pb-4 pt-5">
                    <div>
                        <h2 className="font-display text-[1.15rem] leading-none text-[#f3efe4]">Data Request</h2>
                        <p className="mt-1.5 text-[10px] leading-relaxed text-white/42">
                            Submit a request for data access and we will follow up by email.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1.5 text-white/34 transition-colors hover:bg-white/5 hover:text-white/72"
                        aria-label="Close"
                    >
                        <X size={14} />
                    </button>
                </div>

                {status === 'success' ? (
                    <div className="flex flex-col items-center gap-4 px-5 py-10 text-center">
                        <CheckCircle2 size={32} className="text-emerald-400/80" />
                        <div>
                            <p className="text-[13px] font-semibold text-white/88">Request received</p>
                            <p className="mt-1 text-[11px] leading-relaxed text-white/46">
                                Your request has been received. A follow-up will be sent to the email address provided.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="mt-2 rounded-lg bg-brand-gold/15 px-5 py-2.5 text-[11px] font-semibold text-brand-gold transition-colors hover:bg-brand-gold/25"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Name <span className="text-brand-gold/60">*</span></label>
                                <input required value={form.name} onChange={set('name')} placeholder="Your name" className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Email <span className="text-brand-gold/60">*</span></label>
                                <input required type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Organisation</label>
                            <input value={form.organisation} onChange={set('organisation')} placeholder="University, NGO, company..." className={inputClass} />
                        </div>

                        <div>
                            <label className={labelClass}>Requested Data <span className="text-brand-gold/60">*</span></label>
                            <textarea
                                required
                                rows={3}
                                value={form.dataRequested}
                                onChange={set('dataRequested')}
                                placeholder="Dataset, area of interest, year range, preferred format..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Intended Use</label>
                            <textarea
                                rows={2}
                                value={form.intendedUse}
                                onChange={set('intendedUse')}
                                placeholder="Research, policy, conservation planning..."
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        {status === 'error' && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/8 px-3 py-2.5">
                                <AlertCircle size={12} className="shrink-0 text-red-400/80" />
                                <p className="text-[11px] text-red-300/80">The request could not be submitted. Please try again.</p>
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-2 border-t border-white/8 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                            <button type="button" onClick={onClose} className="w-full rounded-lg px-4 py-2.5 text-[11px] text-white/42 transition-colors hover:text-white/72 sm:w-auto">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-gold px-5 py-2.5 text-[11px] font-semibold text-brand-deep transition-opacity disabled:opacity-50 sm:w-auto"
                            >
                                <Send size={11} />
                                {status === 'sending' ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
