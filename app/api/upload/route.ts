
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const formData = await request.formData();
    
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const fileRealName = file.name.split(".").slice(0, -1).join(".");
    const fileName = `${fileRealName}-loudowls-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error, data } = await supabase.storage
      .from("blogs")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("blogs").getPublicUrl(fileName);

    return NextResponse.json({ publicUrl, id: data.id });
  } catch (error: unknown) {
    console.error('Error in upload API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
