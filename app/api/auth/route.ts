import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { slug, passcode } = await req.json();

    if (!slug || !passcode) {
      return NextResponse.json({ error: 'Slug and Passcode are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('qr_codes')
      .select('edit_id')
      .eq('slug', slug)
      .eq('passcode', passcode)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid Passcode or QR Code not found' }, { status: 401 });
    }

    return NextResponse.json({ edit_id: data.edit_id });
  } catch (err) {
    console.error('Auth API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
