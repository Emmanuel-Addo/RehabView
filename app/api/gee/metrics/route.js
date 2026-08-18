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

        if (!requestedYear || !region) {
            return NextResponse.json({ error: 'Year and region are required' }, { status: 400 });
        }

        const regionsFC = ee.FeatureCollection(config.REGIONS_FC);
        const districtsFC = ee.FeatureCollection(config.DISTRICTS_FC);

        let areaOfInterest;
        if (district) {
            areaOfInterest = districtsFC.filter(ee.Filter.and(
                ee.Filter.eq('REGION', region),
                ee.Filter.eq('Dist_Name', district)
            ));
        } else {
            areaOfInterest = regionsFC.filter(ee.Filter.eq('REGION_1', region));
        }

        const areaGeometry = areaOfInterest.geometry();

        function buildNdviImage(y) {
            const startDate = ee.Date.fromYMD(y, 1, 1);
            const endDate = ee.Date.fromYMD(y, 12, 31);
            const s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                .filterDate(startDate, endDate)
                .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
                .filterBounds(areaGeometry);
            const composite = s2.median();
            return composite.normalizedDifference(['B8', 'B4']).rename('NDVI');
        }

        const currentNdvi = buildNdviImage(requestedYear);
        const currentMean = await evaluatePromise(
            currentNdvi.reduceRegion({
                reducer: ee.Reducer.mean(),
                geometry: areaGeometry,
                scale: 10,
                maxPixels: 1e9
            }).get('NDVI')
        );

        const prevYear = requestedYear - 1;
        const prevNdvi = buildNdviImage(prevYear);
        const prevMean = await evaluatePromise(
            prevNdvi.reduceRegion({
                reducer: ee.Reducer.mean(),
                geometry: areaGeometry,
                scale: 10,
                maxPixels: 1e9
            }).get('NDVI')
        );

        const validYears = Array.isArray(years)
            ? years.map(y => parseInt(y, 10))
            : [2020, 2021, 2022, 2023, 2024, 2025];

        const trend = [];
        for (const y of validYears) {
            const ndviImg = buildNdviImage(y);
            const meanVal = await evaluatePromise(
                ndviImg.reduceRegion({
                    reducer: ee.Reducer.mean(),
                    geometry: areaGeometry,
                    scale: 10,
                    maxPixels: 1e9
                }).get('NDVI')
            );
            trend.push({ year: y, ndvi: meanVal });
        }

        const vegetationHealth = currentMean > 0.6 ? 'Healthy' : currentMean > 0.4 ? 'Moderate' : 'Degraded';

        return NextResponse.json({
            ndvi: currentMean,
            prevNdvi: prevMean,
            ndviChange: currentMean - prevMean,
            vegetationHealth,
            trend,
        });

    } catch (error) {
        console.error('GEE Metrics Error:', error.message);
        return NextResponse.json({
            ndvi: 0,
            prevNdvi: 0,
            ndviChange: 0,
            vegetationHealth: 'Unknown',
            trend: [],
        });
    }
}
