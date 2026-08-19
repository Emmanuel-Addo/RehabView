"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    AlertTriangle,
    BarChart3,
    ChevronDown,
    ChevronUp,
    Crosshair,
    Database,
    HelpCircle,
    Info,
    Layers,
    MapPin,
    Maximize2,
    Menu,
    Minimize2,
    Minus,
    MoreHorizontal,
    Pentagon,
    Plus,
    RotateCcw,
    Send,
    Share2,
    TreePine,
    Download,
    LogOut,
} from 'lucide-react';

import { GlassPanel } from '@/components/ui/GlassPanel.jsx';
import { TourGuide } from '@/components/layout/TourGuide.jsx';
import { AboutModal } from '@/components/modals/AboutModal.jsx';
import { DisclaimerModal } from '@/components/modals/DisclaimerModal.jsx';
import { RequestDataModal } from '@/components/modals/RequestDataModal.jsx';
import { LossChart } from '@/components/dashboard/LossChart.jsx';

const ABOUT_KEY = 'RehabView_about_seen';
const DISCLAIMER_KEY = 'RehabView_disclaimer_seen';
const ANALYSIS_SCOPES = {
    region: 'Region',
    district: 'District',
};

const LAYER_INFO = {
    ndvi: {
        name: 'Vegetation health (NDVI)',
        source: 'Sentinel-2 satellite imagery',
        dot: 'bg-emerald-500',
        gradient: 'linear-gradient(90deg,#8B4513 0%,#D2691E 24%,#9ACD32 52%,#228B22 78%,#006400 100%)',
        lowLabel: 'Bare soil',
        highLabel: 'Dense vegetation',
    },
    region: { name: 'Region boundary', source: 'Ghana Administrative', dot: 'bg-white/50' },
    district: { name: 'District boundary', source: 'Ghana Administrative', dot: 'bg-cyan-400' },
};

function computeTakeaway(metrics, selectedYear, selectedRegion, selectedDistrict) {
    const { ndvi, prevNdvi, vegetationHealth } = metrics;
    const referenceYear = (selectedYear || 2024) - 1;

    if (prevNdvi > 0 && ndvi > 0) {
        const change = ((ndvi - prevNdvi) / prevNdvi) * 100;
        if (Math.abs(change) > 3) {
            return change > 0
                ? `NDVI improved by ${change.toFixed(0)}% relative to ${referenceYear}.`
                : `NDVI declined by ${Math.abs(change).toFixed(0)}% relative to ${referenceYear}.`;
        }
        return `NDVI remained broadly stable relative to ${referenceYear}.`;
    }

    if (ndvi > 0) {
        return `Average NDVI is ${ndvi.toFixed(2)}, indicating ${vegetationHealth || 'moderate'} vegetation health.`;
    }

    if (!selectedRegion) return 'Select a region and year to begin analysis.';
    if (!selectedDistrict) return `Regional NDVI estimates for ${selectedRegion}, ${selectedYear}.`;
    return `District NDVI estimates for ${selectedDistrict}, ${selectedYear}.`;
}

const MapComponent = dynamic(() => import('@/components/map/Map.jsx'), { ssr: false });

function compactValue(val) {
    const num = parseFloat(val) || 0;
    if (num >= 1_000_000) return { value: (num / 1_000_000).toFixed(1), suffix: 'M' };
    if (num >= 1_000) return { value: (num / 1_000).toFixed(1), suffix: 'k' };
    return { value: num.toFixed(0), suffix: '' };
}

function formatPercent(base, current) {
    if (!base) return null;
    return ((current - base) / base) * 100;
}

function FloatingToggle({ label, active, onToggle, icon: Icon, iconColor }) {
    return (
        <button onClick={onToggle} className="flex w-full items-center justify-between gap-3 py-2 text-left">
            <div className="flex min-w-0 items-center gap-2.5">
                <Icon size={15} strokeWidth={1.6} style={{ color: iconColor }} className={`shrink-0 transition-opacity ${active ? 'opacity-100' : 'opacity-35'}`} />
                <span className={`text-[10px] font-medium transition-colors ${active ? 'text-white/75' : 'text-white/35'}`}>{label}</span>
            </div>
            <div className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${active ? 'bg-brand-gold/85' : 'bg-white/12'}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${active ? 'right-0.5' : 'left-0.5 bg-white/70'}`} />
            </div>
        </button>
    );
}

function PrimaryMetric({ label, value, suffix, icon: Icon, accentClass, caption }) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4">
            <div className="min-w-0">
                <div className="flex items-center gap-2 text-white/42">
                    <Icon size={13} className={accentClass} />
                    <span className="text-[11px] font-medium">{label}</span>
                </div>
                <div className="mt-3 flex items-end gap-1.5">
                    <span className="font-display text-[2.35rem] leading-none text-[#f3efe4]">{value}</span>
                    {suffix ? <span className="font-display pb-1 text-[1.15rem] leading-none text-white/54">{suffix}</span> : null}
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-[10px]">
                    <span className="text-white/28">tonnes C</span>
                    <span className="text-white/34">{caption}</span>
                </div>
            </div>
        </div>
    );
}

function SecondaryMetric({ label, value, helper, icon: Icon, accentClass, valueClassName = 'text-[#f3efe4]' }) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3.5">
            <div className="flex items-center gap-2 text-white/42">
                <Icon size={13} className={accentClass} />
                <span className="text-[11px] font-medium">{label}</span>
            </div>
            <div className={`mt-3 font-display text-[1.65rem] leading-none ${valueClassName}`}>
                {value}
            </div>
            <div className="mt-2 text-[10px] leading-snug text-white/30">
                {helper}
            </div>
        </div>
    );
}

export default function Dashboard() {
    const router = useRouter();
    const pendingUrlDistrictRef = useRef('');
    const [isMobile, setIsMobile] = useState(false);
    const [mobilePanel, setMobilePanel] = useState(null);
    const [isSetupOpen, setIsSetupOpen] = useState(true);
    const [isFindingsOpen, setIsFindingsOpen] = useState(true);
    const [tourTrigger, setTourTrigger] = useState(0);
    const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [isRequestOpen, setIsRequestOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error("Error signing out: ", err);
        } finally {
            router.push('/');
        }
    };

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const disclaimerSeen = window.localStorage.getItem(DISCLAIMER_KEY);
        if (disclaimerSeen) {
            const aboutSeen = window.localStorage.getItem(ABOUT_KEY);
            if (!aboutSeen) {
                const id = window.setTimeout(() => setIsAboutOpen(true), 600);
                return () => window.clearTimeout(id);
            }
            return;
        }
        const id = window.setTimeout(() => setIsDisclaimerOpen(true), 400);
        return () => window.clearTimeout(id);
    }, []);

    const [zoomCommand, setZoomCommand] = useState(null);
    const [mapCommand, setMapCommand] = useState(null);
    const [basemap, setBasemap] = useState('dark');
    const [ndviOpacity, setNdviOpacity] = useState(1);
    const [showBasemaps, setShowBasemaps] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

    const [years, setYears] = useState([]);
    const [regions, setRegions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [selectedLayers, setSelectedLayers] = useState(['ndvi']);
    const [metrics, setMetrics] = useState({ ndvi: 0, prevNdvi: 0, ndviChange: 0, vegetationHealth: 'Unknown', trend: [] });
    const [metadataError, setMetadataError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [analysisScope, setAnalysisScope] = useState('region');
    const [draftYear, setDraftYear] = useState(null);
    const [draftRegion, setDraftRegion] = useState('');
    const [draftDistrict, setDraftDistrict] = useState('');
    const [activeYear, setActiveYear] = useState(null);
    const [activeRegion, setActiveRegion] = useState('');
    const [activeDistrict, setActiveDistrict] = useState('');
    const [districtsError, setDistrictsError] = useState(null);
    const [metricsError, setMetricsError] = useState(null);
    const [loadingMetrics, setLoadingMetrics] = useState(false);
    const [activeTab, setActiveTab] = useState('setup');

    const toggleLayer = (id) => {
        setSelectedLayers(prev => prev.includes(id) ? prev.filter(layer => layer !== id) : [...prev, id]);
    };

    const resetDashboard = useCallback(() => {
        pendingUrlDistrictRef.current = '';
        setDraftRegion('');
        setDraftDistrict('');
        setActiveRegion('');
        setActiveDistrict('');
        setDistricts([]);
        setAnalysisScope('region');
        setSelectedLayers(['ndvi']);
        setMetrics({ ndvi: 0, prevNdvi: 0, ndviChange: 0, vegetationHealth: 'Unknown', trend: [] });
        setMetadataError(null);
        setMetricsError(null);
        setDistrictsError(null);
        if (years.length > 0) {
            const latestYear = parseInt(years[years.length - 1]);
            setDraftYear(latestYear);
            setActiveYear(null);
        }
        setMapCommand({ type: 'reset', t: Date.now() });
    }, [years]);

    const handleDisclaimerAccept = useCallback(() => {
        if (typeof window !== 'undefined') window.localStorage.setItem(DISCLAIMER_KEY, '1');
        setIsDisclaimerOpen(false);
        const aboutSeen = typeof window !== 'undefined' && window.localStorage.getItem(ABOUT_KEY);
        if (!aboutSeen) setTimeout(() => setIsAboutOpen(true), 300);
    }, []);

    const closeAboutModal = useCallback(() => {
        if (typeof window !== 'undefined') window.localStorage.setItem(ABOUT_KEY, '1');
        setIsAboutOpen(false);
    }, []);

    const openTourFromAbout = useCallback(() => {
        closeAboutModal();
        setTourTrigger(prev => prev + 1);
    }, [closeAboutModal]);

    const handleLocate = useCallback(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => setMapCommand({ type: 'flyTo', lat: pos.coords.latitude, lng: pos.coords.longitude, zoom: 13, t: Date.now() }),
            () => {}
        );
    }, []);

    const handleShare = useCallback(() => {
        const params = new URLSearchParams();
        if (activeYear)     params.set('year',     activeYear);
        if (activeRegion)   params.set('region',   activeRegion);
        if (activeDistrict) params.set('district', activeDistrict);
        if (activeDistrict) params.set('scope',    'district');
        const url = `${window.location.origin}${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        const confirm = () => { setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); };
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(confirm).catch(() => {});
        } else {
            const ta = document.createElement('textarea');
            ta.value = url;
            ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            confirm();
        }
    }, [activeYear, activeRegion, activeDistrict]);

    const downloadCSVReport = useCallback(() => {
        if (!activeRegion) return;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add metadata headers
        csvContent += "RehabView NDVI Analysis Report\r\n";
        csvContent += `Scope,${activeDistrict ? 'District' : 'Region'}\r\n`;
        csvContent += `Location,${activeDistrict || activeRegion}\r\n`;
        csvContent += `Selected Year,${activeYear}\r\n`;
        csvContent += `Average NDVI (Selected Year),${(metrics.ndvi ?? 0).toFixed(4)}\r\n`;
        csvContent += `Vegetation Status,${metrics.vegetationHealth}\r\n`;
        csvContent += `NDVI Change vs Prev Year,${(metrics.ndviChange * 100).toFixed(2)}%\r\n\r\n`;
        
        // Add time series header
        csvContent += "Year,Average NDVI\r\n";
        
        // Add time series rows
        metrics.trend.forEach(row => {
            csvContent += `${row.year},${(row.ndvi ?? 0).toFixed(4)}\r\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const filename = `RehabView_Report_${(activeDistrict || activeRegion).replace(/\s+/g, '_')}_${activeYear}.csv`;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [activeYear, activeRegion, activeDistrict, metrics]);

    const handleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    const hasActiveAnalysis = !!activeRegion;
    const hasDraftLocation = analysisScope === 'district' ? !!draftRegion && !!draftDistrict : !!draftRegion;
    const canRunAnalysis = !!draftYear && hasDraftLocation;
    const hasPendingChanges = draftYear !== activeYear || draftRegion !== activeRegion || draftDistrict !== activeDistrict;
    const sliderFill = years.length > 1 && draftYear ? ((draftYear - years[0]) / (years[years.length - 1] - years[0])) * 100 : 0;

    const takeaway = useMemo(
        () => computeTakeaway(metrics, activeYear, activeRegion, activeDistrict),
        [metrics, activeYear, activeRegion, activeDistrict]
    );

    const runAnalysis = useCallback(() => {
        if (!canRunAnalysis) return;
        setActiveYear(draftYear);
        setActiveRegion(draftRegion);
        setActiveDistrict(analysisScope === 'district' ? draftDistrict : '');
        setMetricsError(null);
        if (isMobile) setMobilePanel(null);
    }, [canRunAnalysis, draftYear, draftRegion, draftDistrict, analysisScope, isMobile]);

    useEffect(() => {
        const abortController = new AbortController();
        const fetchMetadata = async () => {
            try {
                setMetadataError(null);
                const response = await fetch('/api/gee/metadata', { signal: abortController.signal });
                if (!response.ok) throw new Error('Failed to connect to Earth Engine. Check server credentials.');
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                setYears(data.years || []);
                setRegions(data.regions || []);
                if (data.years?.length > 0) {
                    setDraftYear(parseInt(data.years[data.years.length - 1]));
                }

                const sp = new URLSearchParams(window.location.search);
                const urlYear     = parseInt(sp.get('year'));
                const urlRegion   = sp.get('region')   || '';
                const urlDistrict = sp.get('district') || '';
                const urlScope    = sp.get('scope')    || 'region';
                if (urlYear && urlRegion
                    && (data.years || []).includes(String(urlYear))
                    && (data.regions || []).includes(urlRegion)) {
                    const nextScope = urlScope === 'district' ? 'district' : 'region';
                    setDraftYear(urlYear);
                    setDraftRegion(urlRegion);
                    setDraftDistrict('');
                    setAnalysisScope(nextScope);
                    setActiveYear(urlYear);
                    setActiveRegion(urlRegion);
                    setActiveDistrict('');
                    pendingUrlDistrictRef.current = nextScope === 'district' ? urlDistrict : '';
                }
            } catch (err) {
                if (err.name === 'AbortError') return;
                setMetadataError(err.message);
            } finally {
                if (!abortController.signal.aborted) setLoading(false);
            }
        };
        fetchMetadata();
        return () => abortController.abort();
    }, []);

    useEffect(() => {
        if (!draftRegion) {
            setDistricts([]);
            setDraftDistrict('');
            setDistrictsError(null);
            return;
        }
        const abortController = new AbortController();
        const fetchDistricts = async () => {
            setLoadingDistricts(true);
            setDistrictsError(null);
            try {
                const response = await fetch('/api/gee/districts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ region: draftRegion }),
                    signal: abortController.signal,
                });
                if (!response.ok) throw new Error('Failed to load districts');
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                const nextDistricts = data.districts || [];
                setDistricts(nextDistricts);

                if (analysisScope !== 'district') {
                    setDraftDistrict('');
                    pendingUrlDistrictRef.current = '';
                    return;
                }

                const pendingUrlDistrict = pendingUrlDistrictRef.current;
                const nextDistrict = pendingUrlDistrict
                    ? (nextDistricts.includes(pendingUrlDistrict) ? pendingUrlDistrict : '')
                    : (nextDistricts.includes(draftDistrict) ? draftDistrict : '');

                setDraftDistrict(nextDistrict);
                if (activeRegion === draftRegion) setActiveDistrict(nextDistrict);
                pendingUrlDistrictRef.current = '';
            } catch (err) {
                if (err.name === 'AbortError') return;
                setDistrictsError(err.message);
                setDistricts([]);
            } finally {
                if (!abortController.signal.aborted) setLoadingDistricts(false);
            }
        };
        fetchDistricts();
        return () => abortController.abort();
    }, [draftRegion, analysisScope, activeRegion, draftDistrict]);

    useEffect(() => {
        if (!activeYear || !activeRegion) {
        setMetrics({ ndvi: 0, prevNdvi: 0, ndviChange: 0, vegetationHealth: 'Unknown', trend: [] });
            setLoadingMetrics(false);
            return;
        }
        const abortController = new AbortController();
        const fetchMetrics = async () => {
            setLoadingMetrics(true);
            setMetricsError(null);
            try {
                const response = await fetch('/api/gee/metrics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ year: activeYear, region: activeRegion, district: activeDistrict, years }),
                    signal: abortController.signal,
                });
                if (!response.ok) throw new Error('Failed to load metrics');
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                setMetrics(data);
            } catch (err) {
                if (err.name === 'AbortError') return;
                setMetricsError(err.message);
            } finally {
                if (!abortController.signal.aborted) setLoadingMetrics(false);
            }
        };
        fetchMetrics();
        return () => abortController.abort();
    }, [activeYear, activeRegion, activeDistrict, years]);

    useEffect(() => {
        if (activeRegion) {
            setSelectedLayers(prev => prev.includes('region') ? prev : [...prev, 'region']);
        }
    }, [activeRegion]);

    useEffect(() => {
        setSelectedLayers(prev => {
            if (activeDistrict) return prev.includes('district') ? prev : [...prev, 'district'];
            return prev.includes('district') ? prev.filter(layer => layer !== 'district') : prev;
        });
    }, [activeDistrict]);



    const ndviFmt = compactValue(metrics.ndvi);

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-brand-deep text-white selection:bg-brand-gold/30">
            <div id="tour-map" className="absolute inset-0 z-0">
                <MapComponent
                    year={activeYear ?? (years.length > 0 ? parseInt(years[years.length - 1]) : null)}
                    region={activeRegion}
                    district={activeDistrict}
                    activeLayers={selectedLayers}
                    zoomCommand={zoomCommand}
                    mapCommand={mapCommand}
                    basemap={basemap}
                    ndviOpacity={ndviOpacity}
                />
            </div>

            <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_42%,rgba(14,11,8,0.58)_100%)]" />

            {/* Desktop Unified Left Sidebar */}
            <div className="absolute left-0 top-0 bottom-0 z-40 hidden md:flex w-[24rem] flex-col border-r border-white/10 bg-[#050911]/72 backdrop-blur-lg shadow-2xl pointer-events-auto">
                {/* Brand Header */}
                <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
                    <div>
                        <h1 className="font-display text-[1.4rem] leading-none text-[#f3efe4]">Rehab<span className="text-brand-gold">View</span></h1>
                        <p className="mt-1.5 text-[9px] tracking-[0.14em] text-white/34 uppercase">NDVI Vegetation Monitoring</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/8 shrink-0">
                    <button
                        onClick={() => setActiveTab('setup')}
                        className={`flex-1 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'setup' ? 'border-b-2 border-brand-gold text-white bg-white/5' : 'text-white/40 hover:text-white/70'}`}
                    >
                        Configure
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`flex-1 py-3.5 text-center text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'results' ? 'border-b-2 border-brand-gold text-white bg-white/5' : 'text-white/40 hover:text-white/70'}`}
                    >
                        Analytics
                    </button>
                </div>

                {/* Content Panel (Scrollable) */}
                <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {activeTab === 'setup' ? (
                        <div className="space-y-4">
                            {metadataError ? (
                                <div className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-[9px] text-red-200/76">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle size={11} className="mt-0.5 shrink-0 text-red-300" />
                                        <span>{metadataError}</span>
                                    </div>
                                </div>
                            ) : null}

                            <div className="space-y-2">
                                <span className="text-[9px] tracking-[0.12em] text-white/30 uppercase">Scope</span>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(ANALYSIS_SCOPES).map(([scopeId, label]) => (
                                        <button
                                            key={scopeId}
                                            onClick={() => {
                                                setAnalysisScope(scopeId);
                                                if (scopeId === 'region') setDraftDistrict('');
                                            }}
                                            className={`border px-3 py-2 text-[10px] font-medium transition-colors ${analysisScope === scopeId ? 'border-brand-gold/55 bg-brand-gold/10 text-[#dfbd84]' : 'border-white/10 text-white/46 hover:border-white/20 hover:text-white/78'}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="mb-1.5 block text-[9px] tracking-[0.12em] text-white/30 uppercase">Region</label>
                                    <select value={draftRegion} onChange={(e) => { setDraftRegion(e.target.value); setDraftDistrict(''); }} className="h-11 w-full appearance-none border border-white/10 bg-[#0f1114] px-3 text-[11px] font-medium text-white outline-none transition-colors focus:border-brand-gold/60 cursor-pointer">
                                        <option value="" className="bg-brand-deep">Select region</option>
                                        {regions.map(region => <option key={region} value={region} className="bg-brand-deep">{region}</option>)}
                                    </select>
                                </div>
                                {analysisScope === 'district' ? (
                                    <div>
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <label className="block text-[9px] tracking-[0.12em] text-white/30 uppercase">District</label>
                                        </div>
                                        <select value={draftDistrict} onChange={(e) => setDraftDistrict(e.target.value)} disabled={loadingDistricts || !draftRegion} className="h-11 w-full appearance-none border border-white/10 bg-[#0f1114] px-3 text-[11px] font-medium text-white outline-none transition-colors focus:border-brand-gold/60 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
                                            <option value="" className="bg-brand-deep">{!draftRegion ? 'Select a region first' : 'Select district'}</option>
                                            {districts.map(district => <option key={district} value={district} className="bg-brand-deep">{district}</option>)}
                                        </select>
                                        {districtsError ? <p className="mt-1 text-[9px] text-red-300/70">{districtsError}</p> : null}
                                    </div>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] tracking-[0.12em] text-white/30 uppercase">Year</span>
                                    <span className="font-mono text-[12px] text-brand-gold">{draftYear}</span>
                                </div>
                                <input
                                    type="range"
                                    min={years[0] || 2015}
                                    max={years[years.length - 1] || 2024}
                                    step="1"
                                    value={draftYear || years[years.length - 1] || 2024}
                                    onChange={(e) => setDraftYear(parseInt(e.target.value))}
                                    className="year-slider"
                                    style={{ background: `linear-gradient(to right, #10b981 0%, #10b981 ${sliderFill}%, rgba(255,255,255,0.10) ${sliderFill}%, rgba(255,255,255,0.10) 100%)` }}
                                />
                                {years.length > 0 ? (
                                    <div className="flex justify-between">
                                        {years.map((year) => (
                                            <span key={year} className={`font-mono text-[8px] ${parseInt(year) === draftYear ? 'text-brand-gold/78' : 'text-white/18'}`}>
                                                {String(year).slice(-2)}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            <button onClick={runAnalysis} disabled={!canRunAnalysis} className="w-full bg-[#10b981] px-4 py-3 text-[10px] font-semibold tracking-[0.06em] text-[#0a1628] transition-colors hover:bg-[#34d399] disabled:cursor-not-allowed disabled:opacity-40">
                                {hasPendingChanges && hasActiveAnalysis ? 'Update Analysis' : 'Run Analysis'}
                            </button>

                            <div>
                                <span className="text-[10px] font-bold tracking-[0.14em] text-white/80 uppercase">Legend</span>
                                <div className="mt-2 space-y-3">
                                    <div>
                                        <FloatingToggle label="Vegetation health (NDVI)" active={selectedLayers.includes('ndvi')} onToggle={() => toggleLayer('ndvi')} icon={TreePine} iconColor="#7ecb92" />
                                        {selectedLayers.includes('ndvi') ? (
                                            <div className="mt-1.5 pl-[26px]">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <input
                                                        type="range"
                                                        min={10}
                                                        max={100}
                                                        value={Math.round(ndviOpacity * 100)}
                                                        onChange={(e) => setNdviOpacity(parseInt(e.target.value) / 100)}
                                                        className="opacity-slider flex-1"
                                                    />
                                                    <span className="w-7 shrink-0 text-right font-mono text-[8px] text-white/34">{Math.round(ndviOpacity * 100)}%</span>
                                                </div>
                                                <div
                                                    className="h-2.5 w-full rounded-full border border-white/10"
                                                    style={{ background: LAYER_INFO.ndvi.gradient }}
                                                />
                                                <div className="mt-1 flex items-center justify-between text-[8px] uppercase tracking-[0.08em] text-white/34">
                                                    <span>{LAYER_INFO.ndvi.lowLabel}</span>
                                                    <span>{LAYER_INFO.ndvi.highLabel}</span>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    {hasActiveAnalysis ? <FloatingToggle label="Region boundary" active={selectedLayers.includes('region')} onToggle={() => toggleLayer('region')} icon={Pentagon} iconColor="#c8c8c8" /> : null}
                                    {activeDistrict ? <FloatingToggle label="District boundary" active={selectedLayers.includes('district')} onToggle={() => toggleLayer('district')} icon={Pentagon} iconColor="#d4b27a" /> : null}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {!hasActiveAnalysis ? (
                                <p className="text-[12px] leading-relaxed text-white/42">
                                    Select an area and year under Configure, then click Run Analysis to view results.
                                </p>
                            ) : (
                                <>
                                    {metricsError ? (
                                        <div className="border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[10px] text-red-200/76">
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle size={12} className="mt-0.5 shrink-0 text-red-300" />
                                                <span>{metricsError}</span>
                                            </div>
                                        </div>
                                    ) : null}

                                    <p className="font-display text-[1.2rem] leading-snug text-[#f3efe4]">{takeaway}</p>

                                    <div className="mt-5 space-y-3">
                                        <PrimaryMetric
                                            label="Average NDVI"
                                            value={ndviFmt.value}
                                            suffix={ndviFmt.suffix}
                                            icon={TreePine}
                                            accentClass="text-[#7ecb92]"
                                            caption={metrics.vegetationHealth}
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <SecondaryMetric
                                                label="NDVI Change"
                                                value={`${metrics.ndviChange > 0 ? '+' : ''}${(metrics.ndviChange * 100).toFixed(1)}%`}
                                                helper="vs previous year"
                                                icon={BarChart3}
                                                accentClass="text-[#7ecb92]"
                                            />
                                            <SecondaryMetric
                                                label="Health Status"
                                                value={metrics.vegetationHealth || 'N/A'}
                                                helper="vegetation condition"
                                                icon={TreePine}
                                                accentClass="text-[#7ecb92]"
                                            />
                                        </div>
                                        <p className="text-[10px] leading-relaxed text-white/34">
                                            NDVI values range from 0 (bare soil) to 1 (dense vegetation).
                                        </p>
                                    </div>

                                    <button
                                        onClick={downloadCSVReport}
                                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-white/10 cursor-pointer"
                                    >
                                        <Download size={12} />
                                        Download CSV Report
                                    </button>

                                    <div className="mt-5">
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="text-[10px] tracking-[0.12em] text-white/30 uppercase">NDVI timeline</span>
                                            <span className="font-mono text-[10px] text-white/28">{activeYear}</span>
                                        </div>
                                        <LossChart data={metrics.trend} loading={loadingMetrics} />
                                    </div>

                                    <div className="mt-4 border-t border-white/8 pt-3">
                                        <p className="text-[10px] leading-relaxed text-white/38">
                                            Results are model-derived estimates and should be interpreted alongside field evidence.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Desktop Sidebar Footer */}
                <div className="border-t border-white/8 px-6 py-4 bg-black/20 flex flex-col gap-3 shrink-0">
                    {activeYear ? (
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.025] px-2.5 py-1.5 text-[9px] text-white/60">
                                <MapPin size={10} />
                                <span className="font-mono">{activeDistrict || activeRegion}</span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.025] px-2.5 py-1.5 text-[9px] text-white/60">
                                <Database size={10} />
                                <span className="font-mono">{activeYear}</span>
                            </div>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={handleLogout} className="flex items-center justify-center gap-1.5 border border-red-500/20 rounded-lg py-2.5 text-xs text-red-400 bg-red-950/10 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer font-medium">
                            <LogOut size={12} /> Logout
                        </button>
                        <button onClick={() => setIsAboutOpen(true)} className="flex items-center justify-center gap-1.5 border border-white/10 rounded-lg py-2.5 text-xs text-white/60 transition-colors hover:bg-white/6 hover:text-white cursor-pointer">
                            <Info size={12} /> About
                        </button>
                        <button onClick={() => setIsRequestOpen(true)} className="flex items-center justify-center gap-1.5 border border-white/10 rounded-lg py-2.5 text-xs text-white/60 transition-colors hover:bg-white/6 hover:text-white cursor-pointer">
                            <Send size={12} /> Request
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile overlays (only displayed on mobile) */}
            {mobilePanel !== null ? <div className="fixed inset-0 z-30 bg-black/55 md:hidden" onClick={() => setMobilePanel(null)} /> : null}

            <div id="tour-setup-panel" className={`absolute right-4 top-24 z-40 w-[20rem] max-w-[calc(100vw-2rem)] md:hidden transition-transform duration-300 ${isMobile ? (mobilePanel === 'setup' ? 'translate-y-0' : '-translate-y-[120%]') : ''}`}>
                <GlassPanel className="pointer-events-auto rounded-2xl border-white/10">
                    <div className="border-b border-white/8 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.14em] text-white/80 uppercase">Setup</p>
                                <p className="mt-1 text-[10px] leading-snug text-white/50">Choose area and year, then run the analysis.</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={resetDashboard} className="rounded-lg p-2 text-white/34 transition-colors hover:bg-white/6 hover:text-white" title="Reset">
                                    <RotateCcw size={12} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 px-4 py-4">
                        {metadataError ? (
                            <div className="border border-red-500/30 bg-red-500/10 px-3 py-2 text-[9px] text-red-200/76">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle size={11} className="mt-0.5 shrink-0 text-red-300" />
                                    <span>{metadataError}</span>
                                </div>
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <span className="text-[9px] tracking-[0.12em] text-white/30 uppercase">Scope</span>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(ANALYSIS_SCOPES).map(([scopeId, label]) => (
                                    <button
                                        key={scopeId}
                                        onClick={() => {
                                            setAnalysisScope(scopeId);
                                            if (scopeId === 'region') setDraftDistrict('');
                                        }}
                                        className={`border px-3 py-2 text-[10px] font-medium transition-colors ${analysisScope === scopeId ? 'border-brand-gold/55 bg-brand-gold/10 text-[#dfbd84]' : 'border-white/10 text-white/46 hover:border-white/20 hover:text-white/78'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="mb-1.5 block text-[9px] tracking-[0.12em] text-white/30 uppercase">Region</label>
                                <select value={draftRegion} onChange={(e) => { setDraftRegion(e.target.value); setDraftDistrict(''); }} className="h-11 w-full appearance-none border border-white/10 bg-[#0f1114] px-3 text-[11px] font-medium text-white outline-none transition-colors focus:border-brand-gold/60 cursor-pointer">
                                    <option value="" className="bg-brand-deep">Select region</option>
                                    {regions.map(region => <option key={region} value={region} className="bg-brand-deep">{region}</option>)}
                                </select>
                            </div>
                            {analysisScope === 'district' ? (
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label className="block text-[9px] tracking-[0.12em] text-white/30 uppercase">District</label>
                                    </div>
                                    <select value={draftDistrict} onChange={(e) => setDraftDistrict(e.target.value)} disabled={loadingDistricts || !draftRegion} className="h-11 w-full appearance-none border border-white/10 bg-[#0f1114] px-3 text-[11px] font-medium text-white outline-none transition-colors focus:border-brand-gold/60 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40">
                                        <option value="" className="bg-brand-deep">{!draftRegion ? 'Select a region first' : 'Select district'}</option>
                                        {districts.map(district => <option key={district} value={district} className="bg-brand-deep">{district}</option>)}
                                    </select>
                                    {districtsError ? <p className="mt-1 text-[9px] text-red-300/70">{districtsError}</p> : null}
                                </div>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] tracking-[0.12em] text-white/30 uppercase">Year</span>
                                <span className="font-mono text-[12px] text-brand-gold">{draftYear}</span>
                            </div>
                            <input
                                type="range"
                                min={years[0] || 2015}
                                max={years[years.length - 1] || 2024}
                                step="1"
                                value={draftYear || years[years.length - 1] || 2024}
                                onChange={(e) => setDraftYear(parseInt(e.target.value))}
                                className="year-slider"
                                style={{ background: `linear-gradient(to right, #10b981 0%, #10b981 ${sliderFill}%, rgba(255,255,255,0.10) ${sliderFill}%, rgba(255,255,255,0.10) 100%)` }}
                            />
                        </div>

                        <button onClick={runAnalysis} disabled={!canRunAnalysis} className="w-full bg-[#10b981] px-4 py-3 text-[10px] font-semibold tracking-[0.06em] text-[#0a1628] transition-colors hover:bg-[#34d399] disabled:cursor-not-allowed disabled:opacity-40">
                            Run Analysis
                        </button>

                        <div>
                            <span className="text-[10px] font-bold tracking-[0.14em] text-white/80 uppercase">Legend</span>
                            <div className="mt-2 space-y-3">
                                <FloatingToggle label="Vegetation health (NDVI)" active={selectedLayers.includes('ndvi')} onToggle={() => toggleLayer('ndvi')} icon={TreePine} iconColor="#7ecb92" />
                            </div>
                        </div>
                    </div>
                </GlassPanel>
            </div>

            <div id="tour-findings-panel" className={`absolute left-4 top-24 z-40 flex max-h-[calc(100vh-7rem)] w-[20rem] max-w-[calc(100vw-2rem)] flex-col md:hidden transition-transform duration-300 ${isMobile ? (mobilePanel === 'findings' ? 'translate-y-0' : '-translate-y-[120%]') : ''}`}>
                <GlassPanel className="pointer-events-auto flex flex-col border-white/10">
                    <div className="shrink-0 border-b border-white/8 px-5 py-3.5">
                        <p className="text-[10px] font-bold tracking-[0.14em] text-white/80 uppercase">Analysis Results</p>
                    </div>
                    <div className="custom-scrollbar overflow-y-auto px-5 py-5">
                        {!hasActiveAnalysis ? (
                            <p className="text-[12px] leading-relaxed text-white/42">Run analysis to view results.</p>
                        ) : (
                            <>
                                <p className="font-display text-[1.2rem] leading-snug text-[#f3efe4]">{takeaway}</p>
                                <div className="mt-4">
                                    <PrimaryMetric label="Average NDVI" value={ndviFmt.value} suffix={ndviFmt.suffix} icon={TreePine} accentClass="text-[#7ecb92]" caption={metrics.vegetationHealth} />
                                </div>
                            </>
                        )}
                    </div>
                </GlassPanel>
            </div>


            {/* Map controls — bottom-right, clear of the left sidebar */}
            <div className="absolute bottom-6 right-6 z-40 hidden md:flex items-center gap-2">
                {/* Compass */}
                <button onClick={() => setMapCommand({ type: 'reset', t: Date.now() })} title="Reset view" className="map-ctrl flex h-11 w-11 items-center justify-center rounded-2xl transition-colors hover:bg-white/6">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <polygon points="10,2 12.5,10 10,8.5 7.5,10" fill="#10b981" />
                        <polygon points="10,18 12.5,10 10,11.5 7.5,10" fill="rgba(255,255,255,0.25)" />
                        <circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.5)" />
                    </svg>
                </button>

                {/* Zoom pill */}
                <div className="map-ctrl flex overflow-hidden rounded-2xl">
                    <button onClick={() => setZoomCommand({ type: 'in', t: Date.now() })} title="Zoom in" className="flex h-11 w-11 items-center justify-center text-white/55 transition-colors hover:bg-white/6 hover:text-white">
                        <Plus size={16} strokeWidth={2} />
                    </button>
                    <div className="my-3 w-px bg-white/8" />
                    <button onClick={() => setZoomCommand({ type: 'out', t: Date.now() })} title="Zoom out" className="flex h-11 w-11 items-center justify-center text-white/55 transition-colors hover:bg-white/6 hover:text-white">
                        <Minus size={16} strokeWidth={2} />
                    </button>
                </div>

                {/* Basemap toggle — picker opens upward */}
                <div className="relative">
                    {showBasemaps ? (
                        <div className="map-ctrl absolute bottom-full left-1/2 mb-2 w-52 -translate-x-1/2 overflow-hidden rounded-2xl">
                            <div className="border-b border-white/8 px-4 py-3">
                                <span className="text-[10px] font-bold tracking-[0.12em] text-white/55 uppercase">Base map</span>
                            </div>
                            <div className="py-1">
                                {[
                                    { id: 'dark', label: 'Dark' },
                                    { id: 'satellite', label: 'Satellite' },
                                    { id: 'osm', label: 'Classic' },
                                ].map((opt) => {
                                    const active = basemap === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => { setBasemap(opt.id); setShowBasemaps(false); }}
                                            className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${active ? 'bg-brand-gold/8' : 'hover:bg-white/5'}`}
                                        >
                                            <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${active ? 'border-brand-gold bg-brand-gold/15' : 'border-white/20'}`}>
                                                {active && <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />}
                                            </span>
                                            <span className={`text-[11px] font-medium transition-colors ${active ? 'text-[#eab08c]' : 'text-white/55'}`}>{opt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}
                    <button onClick={() => setShowBasemaps(prev => !prev)} title="Basemap" className={`map-ctrl flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${showBasemaps ? 'text-brand-gold' : 'text-white/55 hover:bg-white/6 hover:text-white'}`}>
                        <Layers size={16} strokeWidth={1.6} />
                    </button>
                </div>

                {/* Locate */}
                <button onClick={handleLocate} title="My location" className="map-ctrl flex h-11 w-11 items-center justify-center rounded-2xl text-white/55 transition-colors hover:bg-white/6 hover:text-white">
                    <Crosshair size={16} strokeWidth={1.6} />
                </button>

                {/* Share */}
                <button onClick={handleShare} title={shareCopied ? 'Copied!' : 'Share view'} className={`map-ctrl flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${shareCopied ? 'text-[#6f8f63]' : 'text-white/55 hover:bg-white/6 hover:text-white'}`}>
                    <Share2 size={16} strokeWidth={1.6} />
                </button>

                {/* Fullscreen — commented out
                <button onClick={handleFullscreen} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} className="map-ctrl flex h-11 w-11 items-center justify-center rounded-2xl text-white/55 transition-colors hover:bg-white/6 hover:text-white">
                    {isFullscreen ? <Minimize2 size={16} strokeWidth={1.6} /> : <Maximize2 size={16} strokeWidth={1.6} />}
                </button>
                */}
            </div>

            <DisclaimerModal isOpen={isDisclaimerOpen} onAccept={handleDisclaimerAccept} />
            <AboutModal isOpen={isAboutOpen} onClose={closeAboutModal} onOpenTour={openTourFromAbout} canOpenTour={!isMobile} />
            <RequestDataModal isOpen={isRequestOpen} onClose={() => setIsRequestOpen(false)} />
            <TourGuide autoStart={tourTrigger} />

            {/* Mobile floating map controls — zoom + locate, bottom-right above nav */}
            <div className="absolute bottom-20 right-4 z-40 flex flex-col gap-2 md:hidden">
                <button onClick={handleLocate} title="My location" className="map-ctrl flex h-10 w-10 items-center justify-center rounded-2xl text-white/55 transition-colors hover:bg-white/6 hover:text-white">
                    <Crosshair size={16} strokeWidth={1.6} />
                </button>
                <div className="map-ctrl flex flex-col overflow-hidden rounded-2xl">
                    <button onClick={() => setZoomCommand({ type: 'in', t: Date.now() })} title="Zoom in" className="flex h-10 w-10 items-center justify-center text-white/55 transition-colors hover:bg-white/6 hover:text-white">
                        <Plus size={15} strokeWidth={2} />
                    </button>
                    <div className="mx-2.5 h-px bg-white/8" />
                    <button onClick={() => setZoomCommand({ type: 'out', t: Date.now() })} title="Zoom out" className="flex h-10 w-10 items-center justify-center text-white/55 transition-colors hover:bg-white/6 hover:text-white">
                        <Minus size={15} strokeWidth={2} />
                    </button>
                </div>
            </div>

            {/* Mobile More sheet — slides up above the bottom nav */}
            {mobilePanel === 'more' ? (
                <div className="fixed bottom-14 left-0 right-0 z-40 md:hidden" style={{ background: 'linear-gradient(180deg,rgba(4,5,7,0.97)0%,rgba(2,3,5,0.99)100%)', backdropFilter: 'blur(16px) saturate(120%)', WebkitBackdropFilter: 'blur(16px) saturate(120%)', borderTop: '1px solid rgba(243,239,228,0.08)' }}>
                    <div className="px-4 py-3">
                        <p className="mb-3 text-[9px] font-bold tracking-[0.14em] text-white/40 uppercase">Actions</p>
                        <div className="grid grid-cols-5 gap-2">
                            <button onClick={() => { setIsAboutOpen(true); setMobilePanel(null); }} className="flex flex-col items-center gap-1.5 rounded-xl py-3 text-white/55 transition-colors hover:bg-white/6 hover:text-white">
                                <Info size={18} strokeWidth={1.6} />
                                <span className="text-[9px] font-medium">About</span>
                            </button>
                            <button onClick={() => { handleShare(); setMobilePanel(null); }} className={`flex flex-col items-center gap-1.5 rounded-xl py-3 transition-colors ${shareCopied ? 'text-[#6f8f63]' : 'text-white/55 hover:bg-white/6 hover:text-white'}`}>
                                <Share2 size={18} strokeWidth={1.6} />
                                <span className="text-[9px] font-medium">{shareCopied ? 'Copied!' : 'Share'}</span>
                            </button>
                            <button onClick={() => { setIsRequestOpen(true); setMobilePanel(null); }} className="flex flex-col items-center gap-1.5 rounded-xl py-3 text-white/55 transition-colors hover:bg-white/6 hover:text-white">
                                <Send size={18} strokeWidth={1.6} />
                                <span className="text-[9px] font-medium">Request</span>
                            </button>
                            <button onClick={() => setMapCommand({ type: 'reset', t: Date.now() })} className="flex flex-col items-center gap-1.5 rounded-xl py-3 text-white/55 transition-colors hover:bg-white/6 hover:text-white">
                                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                    <polygon points="10,2 12.5,10 10,8.5 7.5,10" fill="#10b981" />
                                    <polygon points="10,18 12.5,10 10,11.5 7.5,10" fill="rgba(255,255,255,0.35)" />
                                    <circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.6)" />
                                </svg>
                                <span className="text-[9px] font-medium">Reset</span>
                            </button>
                            <button onClick={() => { handleLogout(); setMobilePanel(null); }} className="flex flex-col items-center gap-1.5 rounded-xl py-3 text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300">
                                <LogOut size={18} strokeWidth={1.6} />
                                <span className="text-[9px] font-medium">Logout</span>
                            </button>
                        </div>

                        <p className="mb-2 mt-4 text-[9px] font-bold tracking-[0.14em] text-white/40 uppercase">Base map</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[{ id: 'dark', label: 'Dark' }, { id: 'satellite', label: 'Satellite' }, { id: 'osm', label: 'Classic' }].map(opt => (
                                <button key={opt.id} onClick={() => setBasemap(opt.id)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[10px] font-medium transition-colors ${basemap === opt.id ? 'border-brand-gold/40 bg-brand-gold/8 text-[#eab08c]' : 'border-white/8 text-white/42 hover:bg-white/5 hover:text-white/70'}`}>
                                    <span className={`h-2 w-2 shrink-0 rounded-full ${basemap === opt.id ? 'bg-brand-gold' : 'border border-white/20'}`} />
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Mobile bottom nav */}
            <div className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-stretch border-t border-white/8 bg-[#121519]/96 backdrop-blur-sm md:hidden">
                <button onClick={() => setMobilePanel(p => p === 'setup' ? null : 'setup')} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${mobilePanel === 'setup' ? 'text-[#eab08c]' : 'text-white/28'}`}>
                    <Menu size={18} />
                    <span className="text-[8px] font-medium">Setup</span>
                </button>
                <div className="my-3 w-px bg-white/8" />
                <button onClick={() => setMobilePanel(p => p === 'findings' ? null : 'findings')} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${mobilePanel === 'findings' ? 'text-[#eab08c]' : 'text-white/28'}`}>
                    <BarChart3 size={18} />
                    <span className="text-[8px] font-medium">Results</span>
                </button>
                <div className="my-3 w-px bg-white/8" />
                <button onClick={() => setMobilePanel(p => p === 'more' ? null : 'more')} className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all ${mobilePanel === 'more' ? 'text-[#eab08c]' : 'text-white/28'}`}>
                    <MoreHorizontal size={18} />
                    <span className="text-[8px] font-medium">More</span>
                </button>
            </div>
        </div>
    );
}


