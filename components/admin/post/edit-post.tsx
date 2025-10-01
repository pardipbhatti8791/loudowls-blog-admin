'use client'
import React, { useState, Suspense, useEffect } from "react";
import { Upload, Image, Star, Tag, Eye, Save, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PartialBlock } from "@blocknote/core";
import { toast } from "sonner";
import { MediaPickerDialog } from "@/components/admin/MediaPickerDialog";
import type { Author } from "./create-post";

const EditorComponent = React.lazy(() => import("./BlockEditor"));

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: PartialBlock[];
  thumbnail: string | null;
  cover: string | null;
  isFeatured: boolean;
  tags: string[];
  category: string;
  published_date?: string;
  gradient_colors: string;
  status: "draft" | "published" | "archived";
  author: string;
}

export type CreatePostProps = {
  data: Category[];
  blog: BlogPost;
};

export const EditPost: React.FC<CreatePostProps> = ({ data = [], blog }) => {
  const [loading, setLoading] = useState(false);
  const [blogContent, setBlogContent] = useState<PartialBlock[]>();
  const [post, setPost] = useState<BlogPost>({
    id: blog?.id || "",
    title: blog?.title || "",
    slug: blog?.slug || "",
    excerpt: blog?.excerpt || "",
    content: [{}],
    thumbnail: blog?.thumbnail || null,
    cover: blog?.cover || null,
    isFeatured: blog?.isFeatured || false,
    tags: blog?.tags || [],
    category: blog?.category || "",
    gradient_colors: blog?.gradient_colors || "",
    status: blog?.status || "draft",
    published_date: blog?.published_date || "",
    author: blog?.author || "",
  });

  const [newTag, setNewTag] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState<"thumbnail" | "cover">(
    "cover",
  );
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setAuthorsLoading(true);
      const response = await fetch("/api/authors");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { data } = await response.json();
      setAuthors((data as Author[]) || []);
    } catch (err) {
      console.error("Error fetching authors:", err);
    } finally {
      setAuthorsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setPost((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleMediaSelect = (url: string) => {
    setPost((prev) => ({
      ...prev,
      [mediaPickerType]: url,
    }));
    setShowMediaPicker(false);
  };

  const openMediaPicker = (type: "thumbnail" | "cover") => {
    setMediaPickerType(type);
    setShowMediaPicker(true);
  };

  const addTag = () => {
    if (newTag.trim() && !post.tags.includes(newTag.trim())) {
      setPost((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("title", post.title);
    formData.append("slug", post.slug);
    formData.append("excerpt", post.excerpt);
    formData.append("content", JSON.stringify(blogContent));
    if (post.thumbnail) {
      formData.append("thumbnail", post.thumbnail);
    }
    if (post.cover) {
      formData.append("cover", post.cover);
    }
    formData.append("isFeatured", String(post.isFeatured));
    formData.append("tags", JSON.stringify(post.tags));
    formData.append("category", post.category);
    formData.append("status", post.status);
    formData.append("gradient_colors", post.gradient_colors);
    formData.append("id", post.id);
    formData.append("author", post.author);

    if (post.status === "published") {
      formData.append(
        "published_date",
        post.published_date || new Date().toISOString(),
      );
    }

    try {
      setLoading(true);
      const response = await fetch("/api/update-post", {
        method: "POST",
        body: formData,
      });
      await response.json();

      setLoading(false);
      toast.success("Post updated successfully!");
    } catch (error) {
      setLoading(false);
      console.error("Error saving post:", error);
      alert("Failed to save post. Please try again.");
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-15">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h4 className="text-gray-900">{post?.title ? post?.title : ""}</h4>

            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  post.status === "published"
                    ? "bg-green-100 text-green-800"
                    : post.status === "draft"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </span>
              {post.isFeatured && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Updating..." : "Update Post"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Enter post title..."
                value={post.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full text-3xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent resize-none"
              />
            </div>

            {/* Slug */}
            <div className="mb-6">
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-2">Permalink:</span>
                <span className="text-blue-600">loudowls.com/blog/</span>
                <input
                  type="text"
                  value={post.slug}
                  disabled
                  className="bg-gray-100 text-gray-500 px-2 py-1 rounded border-none outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Content Editor */}
            <div className="mb-6">
              <Suspense fallback={<div>Loading editor...</div>}>
                <EditorComponent
                  setBlogContent={setBlogContent}
                  blogContent={blog.content}
                />
              </Suspense>
              {/* <Editor /> */}
            </div>

            <div className="h-0.5 w-full bg-primary-400 my-10" />

            <textarea
              placeholder="Write a short excerpt for your post..."
              value={post.excerpt}
              onChange={(e) =>
                setPost((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />

            <input
              placeholder="Add gradient colors (tailwind classes)"
              value={post.gradient_colors}
              onChange={(e) =>
                setPost((prev) => ({
                  ...prev,
                  gradient_colors: e.target.value,
                }))
              }
              className="w-full p-4 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 bg-white border-l border-gray-200 p-6 space-y-6">
          {/* Publish Settings */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Publish Settings
            </h5>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Author
                </label>
                <Select
                  value={post.author}
                  onValueChange={(value) =>
                    setPost((prev) => ({ ...prev, author: value as any }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.length > 0 &&
                      authors.map((author) => {
                        return (
                          <SelectItem value={author.id} key={author.id}>
                            {author.name}
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={post.status}
                  onValueChange={(value) =>
                    setPost((prev) => ({ ...prev, status: value as any }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publish Date
                </label>
                <input
                  type="date"
                  value={post.published_date}
                  onChange={(e) => {
                    setPost((prev) => ({
                      ...prev,
                      published_date: e.target.value,
                    }));
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={post.isFeatured}
                  onChange={(e) =>
                    setPost((prev) => ({
                      ...prev,
                      isFeatured: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="featured"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Featured Post
                </label>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-4">Cover Image</h5>
            <div className="space-y-3">
              {post.cover ? (
                <div className="relative">
                  <img
                    src={post.cover}
                    alt="Cover"
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    onClick={() =>
                      setPost((prev) => ({ ...prev, cover: null }))
                    }
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => openMediaPicker("cover")}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to select or upload cover image
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-4">Thumbnail</h5>
            <div className="space-y-3">
              {post.thumbnail ? (
                <div className="relative">
                  <img
                    src={post.thumbnail}
                    alt="Thumbnail"
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    onClick={() =>
                      setPost((prev) => ({ ...prev, thumbnail: null }))
                    }
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => openMediaPicker("thumbnail")}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50"
                >
                  <Image className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Select or upload thumbnail
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-4">Category</h5>
            <Select
              value={post.category}
              onValueChange={(value) =>
                setPost((prev) => ({ ...prev, category: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {data &&
                  data.map((category) => {
                    return (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Tags
            </h5>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add a tag"
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Media Picker Dialog */}
      <MediaPickerDialog
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        title={
          mediaPickerType === "cover"
            ? "Select Cover Image"
            : "Select Thumbnail"
        }
        allowedTypes={["image/*"]}
      />
    </div>
  );
};
