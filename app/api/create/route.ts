import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateRandomString } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const { destination_url, custom_slug, passcode } = await req.json();

    if (!destination_url) {
      return NextResponse.json({ error: 'Destination URL is required' }, { status: 400 });
    }
    if (!passcode || passcode.length < 4) {
      return NextResponse.json({ error: 'A minimum 4-character passcode is required' }, { status: 400 });
    }

    let finalSlug = custom_slug?.trim();

    // If custom slug is provided, check availability
    if (finalSlug) {
      const { data: existing } = await supabase
        .from('qr_codes')
        .select('id')
        .eq('slug', finalSlug)
        .single();
        
      if (existing) {
        return NextResponse.json({ error: 'Custom Short Link is already taken' }, { status: 409 });
      }
    } else {
      // Auto-generate slug
      finalSlug = generateRandomString(6);
      // Ideally we would loop to ensure uniqueness of random, but 6 chars is very collision resistant for a small project.
    }

    const edit_id = generateRandomString(12);

    const { data, error } = await supabase
      .from('qr_codes')
      .insert([
        {
          slug: finalSlug,
          edit_id,
          passcode,
          destination_url,
          style_config: {},
          scan_count: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ slug: finalSlug, edit_id });
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
