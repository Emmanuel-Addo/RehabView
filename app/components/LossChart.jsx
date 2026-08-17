import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Loader2 } from 'lucide-react';

const fmt = (v) => {
    if (typeof v !== 'number') return v;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}k`;
    return v.toFixed(0);
};

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded border border-white/10 bg-[#0f1d32] px-3 py-2 shadow-xl">
            <p className="font-mono mb-1.5 text-[9px] text-brand-gold/75">{label}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="mb-0.5 flex items-center gap-2">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: entry.color }} />
                    <span className="text-[10px] font-medium text-white/60">
                        {entry.dataKey === 'ndvi' ? 'NDVI' : 'Recovery rate'}:
                    </span>
                    <span className="font-mono text-[10px] text-white">
                        {fmt(entry.value)}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const LossChart = ({ data, loading }) => {
    if (loading) {
        return (
            <div className="flex h-36 w-full items-center justify-center">
                <Loader2 size={16} className="animate-spin text-brand-gold/30" />
            </div>
        );
    }

    const chartData = (data || [])
        .filter(d => parseInt(d.year) >= 2019)
        .sort((a, b) => parseInt(a.year) - parseInt(b.year));

    if (chartData.length === 0) {
        return (
                <div className="flex h-36 w-full items-center justify-center text-[10px] font-medium text-white/30">
                    No time-series data available
                </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-3 flex items-center gap-4 px-1">
                <div className="flex items-center gap-1.5">
                    <div className="h-0.5 w-3 bg-[#10b981]" />
                    <span className="text-[9px] font-medium text-[#10b981]">NDVI</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-0.5 w-3 bg-[#6ee7b7]" />
                    <span className="text-[9px] font-medium text-[#6ee7b7]">Recovery rate</span>
                </div>
            </div>

            <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 4, right: 28, bottom: 0, left: 28 }}
                    >
                        <defs>
                            <linearGradient id="colorNdvi" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorRecovery" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6ee7b7" stopOpacity={0.28} />
                                <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <XAxis
                            dataKey="year"
                            type="category"
                            tick={{ fill: 'rgba(110,231,183,0.55)', fontSize: 8, fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            tickFormatter={(val) => String(val)}
                        />

                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            hide={false}
                            tick={{ fill: 'rgba(16,185,129,0.72)', fontSize: 7, fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={fmt}
                            width={26}
                        />

                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            hide={false}
                            tick={{ fill: 'rgba(110,231,183,0.75)', fontSize: 7, fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={fmt}
                            width={26}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="ndvi"
                            stroke="#10b981"
                            strokeWidth={1.5}
                            fillOpacity={1}
                            fill="url(#colorNdvi)"
                            dot={false}
                            activeDot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
                        />
                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="rehabilitationRate"
                            stroke="#6ee7b7"
                            strokeWidth={1.5}
                            fillOpacity={1}
                            fill="url(#colorRecovery)"
                            dot={false}
                            activeDot={{ r: 3, fill: '#6ee7b7', strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
