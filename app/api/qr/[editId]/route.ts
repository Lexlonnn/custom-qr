import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ editId: string }> }
) {
  try {
    const editId = (await params).editId;
    
    if (!editId) {
      return NextResponse.json({ error: 'Edit ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('qr_codes')
      .select('slug, destination_url, style_config, scan_count')
      .eq('edit_id', editId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
