import { NextResponse } from 'next/server';
import { initializeEE, getEE, getConfig } from '@/lib/gee-server';

export async function POST(request) {
    try {
        await initializeEE();
        const ee = getEE();
        const config = getConfig();

        const { region } = await request.json();

        if (!region) {
            return NextResponse.json({ error: 'Region is required' }, { status: 400 });
        }

        const fc = ee.FeatureCollection(config.DISTRICTS_FC);

        const count = await new Promise((res, rej) => {
            fc.size().evaluate((data, err) => {
                err ? rej(err) : res(data);
            });
        });

        const sampleDistrict = await new Promise((res, rej) => {
            fc.first().evaluate((data, err) => {
                err ? rej(err) : res(data);
            });
        });

        const filtered = fc.filter(ee.Filter.stringStartsWith('REGION', region.substring(0, 4)));

        const districts = await new Promise((res, rej) => {
            filtered.aggregate_array('Dist_Name').distinct().sort().evaluate((data, err) => {
                err ? rej(err) : res(data || []);
            });
        });

        return NextResponse.json({
            districts,
            totalCount: count,
            sampleProperties: sampleDistrict ? Object.keys(sampleDistrict.properties || {}) : [],
            sampleRegion: sampleDistrict?.properties?.REGION,
        });

    } catch (error) {
        console.error('GEE Districts Error:', error.message);
        return NextResponse.json({ districts: [] });
    }
}
