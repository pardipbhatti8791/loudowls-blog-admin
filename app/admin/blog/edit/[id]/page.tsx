import { EditPost } from "@/components/admin/post/edit-post";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import React from "react";
import { Toaster } from "@/components/admin/post/Toaster";

interface PageProps {
  params: {
    id: string;
  };
}


export default async function Page({ params }: PageProps) {
  if (!params.id) {
    notFound();
  }

  const supabase = await createClient();

  console.log("Fetching blog with ID:", params.id);

  const [categoriesResponse, blogResponse] = await Promise.all([
    supabase.from("categories").select("*").order("name", { ascending: true }),
    supabase.from("blogs_with_users").select("*").eq("id", params.id).single(),
  ]);

  if (categoriesResponse.error) {
    console.error("Error fetching categories:", categoriesResponse.error);
    throw categoriesResponse.error;
  }

  if (blogResponse.error) {
    console.error("Error fetching blog:", blogResponse.error);
    notFound();
  }

  const blog = blogResponse.data;
  if (!blog) {
    console.error("Blog not found for ID:", params.id);
    notFound();
  }

  const formattedBlog = {
    ...blog,
    id: blog.id,
    content: blog.content || [],
    tags: blog.tags || [],
    gradient_colors: blog.gradient_colors || "",
    category: blog.category || "",
    thumbnail: blog.thumbnail || null,
    cover: blog.cover || null,
    is_featured: blog.is_featured || false,
    status: blog.status || "draft",
    author: blog.author || "",
  };

  return (
    <div className="mt-8">
      <Toaster />
      <EditPost data={categoriesResponse.data} blog={formattedBlog} />
    </div>
  );
}
