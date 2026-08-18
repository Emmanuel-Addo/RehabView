import { ArrowUp, ArrowDown } from 'lucide-react';

function fmtDelta(raw) {
    if (raw === null || raw === undefined || isNaN(raw)) return null;
    const sign = raw >= 0 ? '+' : '-';
    const abs = Math.abs(raw);
    if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}K`;
    return `${sign}${abs.toFixed(0)}`;
}

export const KPI = ({
    label,
    value,
    suffix = '',
    unit = 'tonnes C',
    trendValue,
    absoluteDelta = null,
    prevYear = null,
    invertColor = false,
    icon: Icon,
}) => {
    const isPositive = trendValue > 0;
    const isNeutral = !trendValue || Math.abs(trendValue) < 0.01;

    const directionColor = isNeutral
        ? 'text-white/28'
        : (isPositive
            ? (invertColor ? 'text-[#9a5d3f]' : 'text-[#6f8f63]')
            : (invertColor ? 'text-[#6f8f63]' : 'text-[#9a5d3f]'));

    const changeLabel = isNeutral ? null : (isPositive ? 'increase' : 'decrease');
    const deltaStr = fmtDelta(absoluteDelta);
    const yearLabel = prevYear ? `vs ${prevYear}` : 'vs prev. year';

    return (
        <div className="group flex flex-col rounded-2xl border border-white/8 bg-white/[0.025] p-4 transition-all duration-300 hover:border-white/14">
            <div className="mb-4 flex items-start justify-between">
                <span className="text-[10px] font-medium leading-tight text-white/48">
                    {label}
                </span>
                {Icon && (
                    <div className={`opacity-50 transition-opacity group-hover:opacity-70 ${invertColor ? 'text-[#9a5d3f]' : 'text-[#6f8f63]'}`}>
                        <Icon size={18} strokeWidth={1.5} />
                    </div>
                )}
            </div>

            <div className="mb-1 flex items-baseline gap-1">
                <span className="font-display text-[2.25rem] font-medium leading-none tracking-tight text-[#f3efe4]">
                    {value}
                </span>
                {suffix && (
                    <span className="font-display ml-0.5 text-[1.6rem] font-medium leading-none text-white/56">
                        {suffix}
                    </span>
                )}
            </div>

            <span className="mb-4 text-[10px] font-medium text-white/34">
                {unit}
            </span>

            {trendValue !== undefined && (
                <div className="-mx-1 rounded-b-sm border-t border-white/7 px-1 pt-3">
                    <div className="flex items-center justify-between">
                        <div className={`font-mono flex items-center gap-1 text-[11px] font-medium ${directionColor}`}>
                            {!isNeutral && (isPositive
                                ? <ArrowUp size={11} strokeWidth={2.5} />
                                : <ArrowDown size={11} strokeWidth={2.5} />
                            )}
                            {isNeutral ? '-' : `${Math.abs(trendValue).toFixed(1)}%`}
                        </div>
                        {changeLabel && (
                            <span className={`text-[9px] font-medium ${directionColor} opacity-75`}>
                                {changeLabel}
                            </span>
                        )}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                        {deltaStr ? (
                            <span className={`font-mono text-[9px] ${directionColor} opacity-75`}>
                                {deltaStr} tonnes C
                            </span>
                        ) : (
                            <span />
                        )}
                        <span className="text-[9px] font-medium text-white/28">
                            {yearLabel}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
