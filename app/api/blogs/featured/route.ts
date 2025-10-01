import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function GET(request: NextRequest) {
  try {
    // Get limit parameter from query string (default to 3 for home page)
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "3");

    // Fetch featured blogs
    const { data, error } = await supabase
      .from("blogs_with_users")
      .select("*")
      .eq("isFeatured", true)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured blogs:", error);
      return NextResponse.json({ 
        success: false, 
        error: "Failed to fetch featured blogs",
        data: []
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    });
  } catch (error: unknown) {
    console.error("Server error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error",
      data: []
    }, { status: 500 });
  }
}