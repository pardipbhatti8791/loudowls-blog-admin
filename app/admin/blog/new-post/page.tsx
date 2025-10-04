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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Page</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
  return <CreatePost data={data || []} />;
};

export default page;
