import { NextResponse } from 'next/server';
import { initializeEE, getEE, getConfig } from '@/lib/gee-server';
import { getCached, setCached } from '@/lib/cache';

function evaluatePromise(eeObj) {
    return new Promise((resolve, reject) => {
        eeObj.evaluate((val, err) => {
            if (err) return reject(new Error(err));
            resolve(val ?? null);
        });
    });
}

export async function POST(request) {
    try {
        const { year, region, district, years } = await request.json();
        const requestedYear = parseInt(year, 10);

        if (!requestedYear || !region) {
            return NextResponse.json({ error: 'Year and region are required' }, { status: 400 });
        }

        // Return instantly if cached
        const cacheKey = `metrics:${region}:${district || ''}:${requestedYear}`;
        const cached = getCached(cacheKey, 'metrics');
        if (cached) {
            return NextResponse.json(cached);
        }

        await initializeEE();
        const ee = getEE();
        const config = getConfig();

        const regionsFC = ee.FeatureCollection(config.REGIONS_FC);
        const districtsFC = ee.FeatureCollection(config.DISTRICTS_FC);

        let areaOfInterest;
        if (district) {
            areaOfInterest = districtsFC.filter(ee.Filter.and(
                ee.Filter.eq('REGION', region),
                ee.Filter.eq('DISTRICT', district)
            ));
        } else {
            areaOfInterest = regionsFC.filter(ee.Filter.eq('REGION_1', region));
        }

        const areaGeometry = areaOfInterest.geometry();

        // 500m for regions, 250m for districts — keeps compute under GEE limits
        const SCALE = district ? 250 : 500;

        function buildNdviImage(y) {
            const startDate = ee.Date.fromYMD(y, 1, 1);
            const endDate = ee.Date.fromYMD(y, 12, 31);
            const s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterDate(startDate, endDate)
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
                .filterBounds(areaGeometry);
            return s2.median().normalizedDifference(['B8', 'B4']).rename('NDVI');
        }

        function getMeanNdvi(y) {
            return evaluatePromise(
                buildNdviImage(y).reduceRegion({
                    reducer: ee.Reducer.mean(),
                    geometry: areaGeometry,
                    scale: SCALE,
                    maxPixels: 1e9,
                    bestEffort: true,
                }).get('NDVI')
            );
        }

        const validYears = Array.isArray(years)
            ? years.map(y => parseInt(y, 10))
            : [2020, 2021, 2022, 2023, 2024, 2025];

        const prevYear = requestedYear - 1;
        const allYears = [...new Set([...validYears, requestedYear, prevYear])].sort();

        // Compute all years in parallel
        const results = await Promise.all(
            allYears.map(y => getMeanNdvi(y).then(v => ({ year: y, ndvi: v })))
        );

        const yearMap = Object.fromEntries(results.map(r => [r.year, r.ndvi]));
        const currentMean = yearMap[requestedYear] ?? 0;
        const prevMean = yearMap[prevYear] ?? 0;
        const trend = validYears.map(y => ({ year: y, ndvi: yearMap[y] ?? 0 }));

        const vegetationHealth =
            currentMean > 0.6 ? 'Healthy' :
            currentMean > 0.4 ? 'Moderate' :
            currentMean > 0.2 ? 'Sparse' :
            currentMean > 0   ? 'Degraded' : 'Unknown';

        const result = {
            ndvi: currentMean,
            prevNdvi: prevMean,
            ndviChange: currentMean - prevMean,
            vegetationHealth,
            trend,
        };

        setCached(cacheKey, result);
        return NextResponse.json(result);

    } catch (error) {
        console.error('GEE Metrics Error:', error.message);
        return NextResponse.json(
            { error: error.message, ndvi: 0, prevNdvi: 0, ndviChange: 0, vegetationHealth: 'Unknown', trend: [] },
            { status: 500 }
        );
    }
}
