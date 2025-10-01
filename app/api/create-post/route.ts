import { createClient } from "@/lib/supabase/server";
export const POST = async (request: Request) => {
  try {
    const supabase = await createClient();
    
    // Get the current user from the session
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title")?.toString();
    const excerpt = formData.get("excerpt")?.toString();
    const slug = formData.get("slug")?.toString();
    let content = formData.get("content");
    if (content) {
      content = JSON.parse(content.toString());
    }
    const thumbnail = formData.get("thumbnail");
    const coverImage = formData.get("coverImage");
    const isFeatured = formData.get("isFeatured") === "true";
    const tags = formData.get("tags");
    const category = formData.get("category");
    const status = formData.get("status")?.toString();
    const author = formData.get("author")?.toString();

    const gradient_colors = formData.get("gradient_colors")?.toString();
    if (!title || !slug || !excerpt || !category) {
      return new Response("Title, slug, Category and Excerpt are required", {
        status: 400,
      });
    }

  const { data, error } = await supabase
      .from("blogs")
      .insert({
        title: title,
        slug,
        excerpt: excerpt,
        content,
        thumbnail: thumbnail ? thumbnail.toString() : null,
        cover: coverImage ? coverImage.toString() : null,
        isFeatured: isFeatured,
        tags: tags ? JSON.parse(tags.toString()) : [],
        category: category ? category : null,
        gradient_colors,
        status: status,
        author: author,
        created_by: session.user.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating blog:", error);
      return new Response(JSON.stringify(error), { status: 500 });
    }

    return new Response(JSON.stringify({ blog_id: data.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error handling blog creation:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
};
