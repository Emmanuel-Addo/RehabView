import { NextResponse } from 'next/server';
import { initializeEE, getEE, getConfig } from '@/lib/gee-server';
import { getCached, setCached } from '@/lib/cache';

export async function POST(request) {
    try {
        const { region } = await request.json();

        if (!region) {
            return NextResponse.json({ error: 'Region is required' }, { status: 400 });
        }

        // Return instantly if cached
        const cacheKey = `districts:${region}`;
        const cached = getCached(cacheKey, 'districts');
        if (cached) {
            return NextResponse.json(cached);
        }

        await initializeEE();
        const ee = getEE();
        const config = getConfig();

        const fc = ee.FeatureCollection(config.DISTRICTS_FC);
        const filtered = fc.filter(ee.Filter.eq('REGION', region));

        const districts = await new Promise((res, rej) => {
            filtered.aggregate_array('DISTRICT').distinct().sort().evaluate((data, err) => {
                err ? rej(err) : res(data || []);
            });
        });

        const result = { districts };
        setCached(cacheKey, result);
        return NextResponse.json(result);

    } catch (error) {
        console.error('GEE Districts Error:', error.message);
        return NextResponse.json({ districts: [] });
    }
}
