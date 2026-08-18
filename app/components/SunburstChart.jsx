import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value, percent } = payload[0].payload;
    return (
        <div className="bg-brand-deep border border-brand-gold/30 rounded px-3 py-2 shadow-xl">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-gold/60 mb-1">{name}</p>
            <p className="text-[11px] font-black text-white tabular-nums">
                {value >= 1e6
                    ? `${(value / 1e6).toFixed(2)}M`
                    : value >= 1e3
                        ? `${(value / 1e3).toFixed(1)}k`
                        : value.toFixed(0)} <span className="text-white/40 font-bold">hectares</span>
            </p>
            <p className="text-[9px] font-bold text-white/40 mt-0.5">
                {(percent * 100).toFixed(1)}% of total
            </p>
        </div>
    );
};

const fmt = (v) =>
    v >= 1e6
        ? `${(v / 1e6).toFixed(2)}M`
        : v >= 1e3
            ? `${(v / 1e3).toFixed(1)}k`
            : v.toFixed(0);

export const CarbonBalanceChart = ({ carbonStock = 0, carbonLoss = 0, loading }) => {
    const total = carbonStock + carbonLoss;

    if (total === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-[9px] uppercase font-black text-brand-faded/20 tracking-widest">
                No data
            </div>
        );
    }

    const data = [
        { name: 'Recovering', value: carbonStock, color: '#10b981' },
        { name: 'Not Recovering', value: carbonLoss, color: '#ef4444' },
    ];

    const lossPercent = ((carbonLoss / total) * 100).toFixed(1);
    const stockPercent = ((carbonStock / total) * 100).toFixed(1);

    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 py-2">
            {/* Donut */}
            <div className="relative" style={{ width: 140, height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Pie
                            data={data}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius={44}
                            outerRadius={64}
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                            animationBegin={0}
                            animationDuration={800}
                        >
                            {data.map((entry, i) => (
                                <Cell key={i} fill={entry.color} opacity={0.9} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Centre label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[15px] font-black text-brand-gold tabular-nums leading-none">
                        {lossPercent}%
                    </span>
                    <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">
                        not recovering
                    </span>
                </div>
            </div>

            {/* Legend rows */}
            <div className="w-full flex flex-col gap-2.5">
                {data.map((item) => {
                    const pct = item.name === 'Not Recovering' ? lossPercent : stockPercent;
                    return (
                        <div key={item.name} className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between gap-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest truncate" style={{ color: item.color }}>
                                        {item.name}
                                    </span>
                                    <span className="text-[9px] font-bold tabular-nums shrink-0" style={{ color: item.color, opacity: 0.6 }}>
                                        {pct}%
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                    <span className="text-[10px] font-black text-white/60 tabular-nums">
                                        {fmt(item.value)}{' '}
                                        <span className="text-white/25 font-bold text-[8px]">ha</span>
                                    </span>
                                </div>
                                {/* Mini bar */}
                                <div className="mt-1 h-0.5 w-full rounded-full bg-white/5 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${pct}%`, background: item.color, opacity: 0.5 }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
