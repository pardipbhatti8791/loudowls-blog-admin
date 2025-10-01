import { CreatePost } from "@/components/admin/post/create-post";
import { supabase } from "@/lib/supabase";
import React from "react";

const page = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
    console.log("data--->", data);

  if (error) {
    return new Response(error.message, { status: 500 });
  }
  return <CreatePost data={data} />;
};

export default page;
