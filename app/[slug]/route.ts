import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug;
    
    if (!slug) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: qrData, error: fetchError } = await supabase
      .from('qr_codes')
      .select('destination_url, scan_count')
      .eq('slug', slug)
      .single();

    if (fetchError || !qrData) {
      return NextResponse.json({ error: 'Link not found or deactivated.' }, { status: 404 });
    }

    // Fire off async scan count update (no await to keep redirect super fast)
    supabase
      .from('qr_codes')
      .update({ scan_count: qrData.scan_count + 1 })
      .eq('slug', slug)
      .then();

    let redirectUrl = qrData.destination_url;
    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      redirectUrl = 'https://' + redirectUrl;
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Redirect Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
