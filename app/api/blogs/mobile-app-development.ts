import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "3");

    // Query blogs specifically for mobile app development
    const { data, error } = await supabase
      .from("blogs_with_users")
      .select("*")
      .eq("status", "published")
      .eq("category_slug", "mobile-app-development")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch mobile app development blogs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      success: true,
    });
  } catch (error: unknown) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}