import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    let payload;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const { name, email, organisation, dataRequested, intendedUse } = payload;

    if (!name || !email || !dataRequested) {
        return NextResponse.json({ error: 'Name, email, and data requested are required' }, { status: 400 });
    }

    try {
        await resend.emails.send({
            from: 'RehabView Data Request <onboarding@resend.dev>',
            to: 'your-email@example.com', // Replace with your email
            replyTo: email,
            subject: `Data Request — ${name}${organisation ? ` (${organisation})` : ''}`,
            html: `
                <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
                    <h2 style="margin-bottom:4px;font-size:18px;">New Data Request</h2>
                    <p style="margin-top:0;color:#666;font-size:13px;">Submitted via RehabView Ghana Portal</p>
                    <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0;" />
                    <table style="width:100%;border-collapse:collapse;font-size:14px;">
                        <tr><td style="padding:8px 0;color:#666;width:140px;">Name</td><td style="padding:8px 0;font-weight:600;">${name}</td></tr>
                        <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#10b981;">${email}</a></td></tr>
                        ${organisation ? `<tr><td style="padding:8px 0;color:#666;">Organisation</td><td style="padding:8px 0;">${organisation}</td></tr>` : ''}
                        <tr><td style="padding:8px 0;color:#666;vertical-align:top;">Data Requested</td><td style="padding:8px 0;">${dataRequested}</td></tr>
                        ${intendedUse ? `<tr><td style="padding:8px 0;color:#666;vertical-align:top;">Intended Use</td><td style="padding:8px 0;">${intendedUse}</td></tr>` : ''}
                    </table>
                    <hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0;" />
                    <p style="font-size:11px;color:#999;">Reply directly to this email to respond to ${name}.</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact route error:', error);
        return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
    }
}

