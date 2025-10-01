import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";


export async function POST(request: NextRequest) {
const formData = await request.formData();
  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString();
  const excerpt = formData.get("excerpt")?.toString();
  const slug = formData.get("slug")?.toString();
  let content = formData.get("content");
  if (content) {
    content = JSON.parse(content.toString());
  }
  const thumbnail = formData.get("thumbnail");
  const cover = formData.get("cover");
  const isFeatured = formData.get("isFeatured") === "true";
  const tags = formData.get("tags");
  const category = formData.get("category");
  const status = formData.get("status")?.toString();
  const gradient_colors = formData.get("gradient_colors")?.toString();
  const published_date = formData.get("published_date")?.toString();

  const author = formData.get("author")?.toString();

  if (!title || !slug || !excerpt || !category || !id || !author) {
    return new Response("Title, slug, Category, Excerpt and id are required", {
      status: 400,
    });
  }

  const { error } = await supabase
    .from("blogs")
    .update({
      title: title,
      slug,
      excerpt: excerpt,
      content,
      thumbnail: thumbnail ? thumbnail.toString() : null,
      cover: cover ? cover.toString() : null,
      isFeatured: isFeatured,
      tags: tags ? JSON.parse(tags.toString()) : [],
      gradient_colors,
      category: category ? category : null,
      status: status,
      archived: status === "archived",
      published_date: published_date ? new Date(published_date) : null,
      author: author,
    })
    .eq("id", id)
    .single();

  if (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }

  return new Response(
    JSON.stringify({ success: "Blog updated successfully" }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
};
