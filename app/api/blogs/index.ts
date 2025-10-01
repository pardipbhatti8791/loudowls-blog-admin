import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const authorId = searchParams.get("author_id") || "";

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from("blogs_with_users")
      .select("*")
      .not("archived", "eq", true);

    let countQuery = supabase
      .from("blogs_with_users")
      .select("*", { count: "exact", head: true })
      .not("archived", "eq", true);

    // Apply search filter
    if (search.trim()) {
      const searchFilter = `title.ilike.%${search}%,excerpt.ilike.%${search}%,full_name.ilike.%${search}%`;
      query = query.or(searchFilter);
      countQuery = countQuery.or(searchFilter);
    }

    // Apply author filter
    if (authorId.trim()) {
      query = query.eq("user_id", authorId);
      countQuery = countQuery.eq("user_id", authorId);
    }

    // Get total count first
    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error("Count error:", countError);
      return NextResponse.json(
        { error: "Failed to get blog count" },
        { status: 500 }
      );
    }

    // Get paginated data
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch blogs" },
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
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
