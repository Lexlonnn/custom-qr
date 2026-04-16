import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ editId: string }> }
) {
  try {
    const editId = (await params).editId;
    const body = await req.json();
    const { destination_url, style_config, slug } = body;

    if (!editId) {
      return NextResponse.json({ error: 'Edit ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (destination_url !== undefined) updates.destination_url = destination_url;
    if (style_config !== undefined) updates.style_config = style_config;
    
    if (slug !== undefined) {
      const cleanSlug = slug.trim().toLowerCase();
      if (cleanSlug.length < 3) {
        return NextResponse.json({ error: 'Custom link must be at least 3 characters.' }, { status: 400 });
      }
      if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
        return NextResponse.json({ error: 'Custom link can only contain letters, numbers, and dashes.' }, { status: 400 });
      }
      updates.slug = cleanSlug;
    }

    const { data, error } = await supabase
      .from('qr_codes')
      .update(updates)
      .eq('edit_id', editId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Custom short link is already taken.' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
