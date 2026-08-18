"use client";

import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('RehabView Dashboard error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen w-screen items-center justify-center bg-brand-deep text-white">
                    <div className="text-center max-w-md px-8">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30">
                                <AlertTriangle size={32} className="text-red-400" />
                            </div>
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-widest mb-2 text-brand-gold">
                            Portal Error
                        </h2>
                        <p className="text-[11px] font-bold text-brand-faded/50 uppercase tracking-widest mb-2">
                            RehabView Ghana
                        </p>
                        <p className="text-sm text-brand-faded/70 mb-8 leading-relaxed">
                            {this.state.error?.message || 'An unexpected error occurred while loading the portal. Reload to try again.'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gold text-brand-deep font-black text-[10px] uppercase tracking-widest rounded hover:opacity-90 transition-opacity"
                        >
                            <RefreshCw size={14} />
                            Reload Portal
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

