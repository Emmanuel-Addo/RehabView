import { NextResponse } from 'next/server';
import { initializeEE, getEE, getConfig } from '@/lib/gee-server';

const YEARS = ['2020', '2021', '2022', '2023', '2024', '2025'];

export async function GET() {
    try {
        await initializeEE();
        const ee = getEE();
        const config = getConfig();

        const regions = await new Promise((res, rej) => {
            ee.FeatureCollection(config.REGIONS_FC)
                .aggregate_array('REGION_1')
                .distinct()
                .sort()
                .evaluate((data, err) => {
                    err ? rej(err) : res(data || []);
                });
        });

        return NextResponse.json({
            years: YEARS,
            regions: regions,
        });

    } catch (error) {
        console.error('GEE Metadata Error:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));
        return NextResponse.json({
            years: YEARS,
            regions: [],
            error: error.message,
        });
    }
}
