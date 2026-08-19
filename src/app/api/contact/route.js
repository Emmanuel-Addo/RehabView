import { NextResponse } from 'next/server';

export async function POST(request) {
    let payload;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const { name, email, dataRequested } = payload;

    if (!name || !email || !dataRequested) {
        return NextResponse.json({ error: 'Name, email, and data requested are required' }, { status: 400 });
    }

    // Request logged — email delivery not configured
    console.log('Data request received:', { name, email, dataRequested });

    return NextResponse.json({ success: true });
}
