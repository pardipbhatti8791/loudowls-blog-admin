import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "3");
    let category = params.category;
    
    console.log("category---->", category);
    
    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    if (category === "ios-app-development") category = "ios-development";
    if (category === "react-native-development") category = "react-native";

    const { data, error } = await supabase
      .from("blogs_with_users")
      .select("*")
      .eq("status", "published")
      .eq("category_slug", category)
      .order("created_at", { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: `Failed to fetch blogs for category: ${category}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || [], success: true });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


