import { NextResponse } from 'next/server';
import { initializeEE, getEE, getConfig } from '@/lib/gee-server';

const NDVI_PALETTE = ['#8B4513', '#D2691E', '#9ACD32', '#228B22', '#006400'];

export async function POST(request) {
    try {
        await initializeEE();
        const ee = getEE();
        const config = getConfig();

        let payload;
        try {
            payload = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
        }

        const { year, region, district } = payload;

        if (!year || !region) {
            return NextResponse.json({ error: 'Year and region are required' }, { status: 400 });
        }

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

        const startDate = ee.Date.fromYMD(year, 1, 1);
        const endDate = ee.Date.fromYMD(year, 12, 31);

        const s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
            .filterDate(startDate, endDate)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
            .filterBounds(areaGeometry);

        const composite = s2.median();
        const ndvi = composite.normalizedDifference(['B8', 'B4']).rename('NDVI');
        const ndviClipped = ndvi.clipToCollection(areaOfInterest);

        const regionBoundary = regionsFC.filter(ee.Filter.eq('REGION_1', region));
        const regionBoundaryImg = ee.Image().paint(regionBoundary, 0, 2);

        const districtBoundary = districtsFC.filter(ee.Filter.eq('REGION', region));
        const districtBoundaryImg = ee.Image().paint(districtBoundary, 0, 1);

        const [ndviMapId, regionMapId, districtMapId, bounds, hoverGeoJSON] = await Promise.all([
            new Promise((res, rej) => ndviClipped.getMapId({ min: 0, max: 1, palette: NDVI_PALETTE }, (id, err) => err ? rej(err) : res(id))),
            new Promise((res, rej) => regionBoundaryImg.getMapId({ palette: 'white' }, (id, err) => err ? rej(err) : res(id))),
            new Promise((res, rej) => districtBoundaryImg.getMapId({ palette: 'cyan' }, (id, err) => err ? rej(err) : res(id))),
            new Promise((res, rej) => areaGeometry.bounds().getInfo((geo, err) => {
                if (err) return rej(err);
                if (!geo || !geo.coordinates) return res(null);
                const coords = geo.coordinates[0];
                const lats = coords.map(c => c[1]);
                const lngs = coords.map(c => c[0]);
                res([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]]);
            })),
            new Promise((res, rej) => {
                const hoverFC = district
                    ? districtsFC.filter(ee.Filter.eq('REGION', region))
                    : regionBoundary;
                const simplified = hoverFC.map(f => f.simplify(500));
                simplified.getInfo((data, err) => err ? rej(err) : res(data));
            }),
        ]);

        return NextResponse.json({
            layers: {
                ndvi: ndviMapId.urlFormat,
                region: regionMapId.urlFormat,
                district: districtMapId.urlFormat,
            },
            bounds,
            hoverGeoJSON,
        });

    } catch (error) {
        console.error('GEE Layers Error:', error.message);
        return NextResponse.json({
            layers: { ndvi: null, region: null, district: null },
            bounds: null,
            hoverGeoJSON: null,
        });
    }
}
