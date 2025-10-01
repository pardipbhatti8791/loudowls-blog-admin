import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

interface DatabaseAuthor {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface Author {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string;
}

export async function GET(_request: NextRequest) {
  try {
    // Get unique authors who have blogs
    const { data, error } = await supabase
      .from("blogs_with_users")
      .select("user_id, full_name, email, avatar_url")
      .not("archived", "eq", true)
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch authors" },
        { status: 500 }
      );
    }

    // Remove duplicates based on user_id
    const uniqueAuthors = data?.reduce((acc: Author[], current: DatabaseAuthor) => {
      const existing = acc.find(
        (author) => author.user_id === current.user_id,
      );
      if (!existing) {
        acc.push({
          user_id: current.user_id,
          full_name: current.full_name,
          email: current.email,
          avatar_url: current.avatar_url || "",
        });
      }
      return acc;
    }, []) || [];

    return NextResponse.json(uniqueAuthors);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
