import { NextResponse } from 'next/server';
import { initializeEE, getEE, getConfig } from '@/lib/gee-server';

function evaluatePromise(eeObj) {
    return new Promise((resolve, reject) => {
        eeObj.evaluate((val, err) => {
            if (err) return reject(new Error(err));
            resolve(val ?? 0);
        });
    });
}

export async function POST(request) {
    try {
        await initializeEE();
        const ee = getEE();
        const config = getConfig();

        const { year, region, district, years } = await request.json();
        const requestedYear = parseInt(year, 10);

        if (!requestedYear) {
            return NextResponse.json({ error: 'Year is required' }, { status: 400 });
        }

        const metadataYears = await new Promise((resolve, reject) => {
            ee.FeatureCollection(config.NDVI_FC)
                .first()
                .propertyNames()
                .evaluate((props, err) => {
                    if (err) return reject(new Error(err));
                    const availableYears = (props || [])
                        .filter(p => /^(20)\d{2}$/.test(p))
                        .map(p => parseInt(p, 10))
                        .sort((a, b) => a - b);
                    resolve(availableYears);
                });
        });

        if (!metadataYears.includes(requestedYear)) {
            return NextResponse.json({ error: 'Invalid year requested' }, { status: 400 });
        }

        const validTrendYears = Array.isArray(years)
            ? years
                .map(y => parseInt(y, 10))
                .filter(y => metadataYears.includes(y))
            : metadataYears;

        const trendYears = validTrendYears.slice(0, metadataYears.length);

        function buildFilter(y) {
            let filter = ee.Filter.notNull([String(y)]);
            if (region) filter = ee.Filter.and(filter, ee.Filter.eq('REGIONS', region));
            if (district) filter = ee.Filter.and(filter, ee.Filter.eq('DISTRICTS', district));
            return filter;
        }

        const ndviFc = ee.FeatureCollection(config.NDVI_FC).filter(buildFilter(requestedYear));
        const rehabilitationFc = ee.FeatureCollection(config.REHABILITATION_FC).filter(buildFilter(requestedYear));

        const [ndvi, rehabilitationRate, hectaresRestored, trendData] = await Promise.all([
            evaluatePromise(ndviFc.aggregate_mean(String(requestedYear))),
            evaluatePromise(rehabilitationFc.aggregate_mean(String(requestedYear))),
            evaluatePromise(rehabilitationFc.aggregate_sum('HECTARES')),
            Promise.all(trendYears.map(async (y) => {
                const filter = buildFilter(y);
                const [ndviVal, rehabRate, hectares] = await Promise.all([
                    evaluatePromise(
                        ee.FeatureCollection(config.NDVI_FC).filter(filter).aggregate_mean(String(y))
                    ),
                    evaluatePromise(
                        ee.FeatureCollection(config.REHABILITATION_FC).filter(filter).aggregate_mean(String(y))
                    ),
                    evaluatePromise(
                        ee.FeatureCollection(config.REHABILITATION_FC).filter(filter).aggregate_sum('HECTARES')
                    ),
                ]);
                return { year: y, ndvi: ndviVal, rehabilitationRate: rehabRate, hectaresRestored: hectares };
            }))
        ]);

        const prevYear = requestedYear - 1;
        const prevData = trendData.find(t => parseInt(t.year) === prevYear) || { ndvi: ndvi, rehabilitationRate: rehabilitationRate };

        return NextResponse.json({
            ndvi,
            rehabilitationRate,
            hectaresRestored,
            prevNdvi: prevData.ndvi,
            prevRehabilitationRate: prevData.rehabilitationRate,
            trend: trendData
        });

    } catch (error) {
        console.error('GEE Metrics Error:', error);
        return NextResponse.json(
            { error: 'Failed to calculate metrics', details: error.message },
            { status: 500 }
        );
    }
}
