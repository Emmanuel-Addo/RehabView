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

        const miningFootprintsFc = ee.FeatureCollection(config.MINING_FOOTPRINTS_FC);

        // Filter MINING_FOOTPRINTS_FC by the selected region
        const filteredFc = miningFootprintsFc.filter(ee.Filter.eq('REGIONS', region));

        // Get districts from the filtered FeatureCollection
        const districts = await new Promise((res, rej) => {
            filteredFc.aggregate_array('DISTRICTS').distinct().sort().evaluate((data, err) => {
                err ? rej(err) : res(data || []);
            });
        });

        return NextResponse.json({ districts });

    } catch (error) {
        console.error('GEE Districts Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch districts', details: error.message },
            { status: 500 }
        );
    }
}
