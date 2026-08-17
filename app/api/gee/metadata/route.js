import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { initializeEE, getEE, getConfig } from '@/lib/gee-server';

export const revalidate = 21600;

const getCachedMetadata = unstable_cache(
    async () => {
        await initializeEE();
        const ee = getEE();
        const config = getConfig();

        const ndviFc = ee.FeatureCollection(config.NDVI_FC);

        const [yearProps, regions] = await Promise.all([
            new Promise((res, rej) => {
                ndviFc.first().propertyNames().evaluate((props, err) => {
                    if (err) return rej(err);
                    const years = props.filter(p => /^(20)\d{2}$/.test(p)).sort();
                    res(years);
                });
            }),
            new Promise((res, rej) => {
                ndviFc.aggregate_array('REGIONS').distinct().sort().evaluate((data, err) => {
                    err ? rej(err) : res(data || []);
                });
            })
        ]);

        return {
            years: yearProps,
            regions
        };
    },
    ['gee-metadata'],
    { revalidate: 21600 }
);

export async function GET() {
    try {
        const data = await getCachedMetadata();
        return NextResponse.json(data);

    } catch (error) {
        console.error('GEE Metadata Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch metadata', details: error.message },
            { status: 500 }
        );
    }
}
