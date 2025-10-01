import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from query string
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const { count } = await supabase
      .from("blogs_with_users")
      .select("*", { count: "exact", head: true })
      .eq("status", "published");

    // Get paginated data
    const { data, error } = await supabase
      .from("blogs_with_users")
      .select("*")
      .eq("status", "published")
      .order("published_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching blogs:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: unknown) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
