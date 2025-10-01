import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface FileMetadata {
  size?: number;
  mimetype?: string;
}

interface StorageFile {
  id: string;
  name: string;
  metadata: FileMetadata;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
 

    if (authError || !user) {
   
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: files, error: listError } = await supabase.storage
      .from("blogs")
      .list(``, {
        limit: limit,
        offset: offset,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (listError) {
      console.error("List error:", listError);
      return NextResponse.json(
        { error: listError.message },
        { status: 500 }
      );
    }

    // Get public URLs for all files
    const mediaFiles =
      files?.map((file: StorageFile) => {
        const { data } = supabase.storage
          .from("blogs")
          .getPublicUrl(`/${file.name}`);

        return {
          id: file.id,
          name: file.name,
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype || "image",
          createdAt: file.created_at,
          url: data.publicUrl,
        };
      }) || [];

    // Check if there are more files
    const hasMore = files?.length === limit;

    return NextResponse.json({
      media: mediaFiles,
      pagination: {
        page,
        limit,
        hasMore,
        total: mediaFiles.length,
      },
    });
  } catch (error: unknown) {
    console.error('Error in media API:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

