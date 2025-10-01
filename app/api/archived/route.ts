// src/pages/api/archived.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const POST = async ( request:NextResponse) => {
  try {
    const contentType = request.headers.get("content-type");
    let blogId: string;

    if (contentType?.includes("application/json")) {
      const body = await request.json();
      blogId = body.id;
    } else {
      const formData = await request.formData();
      blogId = formData.get("id") as string;
    }

    if (!blogId) {
      return new Response(
        JSON.stringify({ error: "Valid blog ID is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { error } = await supabase
      .from("blogs")
      .update({ archived: true })
      .eq("id", blogId);

    if (error) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "Failed to archive blog" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (!contentType?.includes("application/json")) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/admin/blogs",
        },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Blog archived successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
