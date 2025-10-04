'use client'
import React, { useState, useEffect, useCallback } from "react";
import { TrashIcon } from "lucide-react";
import NavPagination from "./Navigation";

export interface Blog {
  id: number;
  full_name: string;
  avatar_url: string;
  email: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
}

interface BlogManagementProps {
  className?: string;
}

interface BlogsResponse {
  data: Blog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const BlogManagement: React.FC<BlogManagementProps> = ({ className = "" }) => {
  const [blogData, setBlogData] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlogs, setSelectedBlogs] = useState<Set<number>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [, setTotalPages] = useState(0);

  const fetchBlogs = useCallback(async (
    page: number = currentPage,
    limit: number = itemsPerPage,
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/blogs?page=${page}&limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BlogsResponse = await response.json();
      setBlogData(result.data || []);
      setTotalItems(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to fetch blogs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchBlogs(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, fetchBlogs]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all blogs on current page
      setSelectedBlogs(new Set(blogData.map((blog) => blog.id)));
    } else {
      setSelectedBlogs(new Set());
    }
  };

  const handleSelectBlog = (blogId: number, checked: boolean) => {
    const newSelected = new Set(selectedBlogs);
    if (checked) {
      newSelected.add(blogId);
    } else {
      newSelected.delete(blogId);
    }
    setSelectedBlogs(newSelected);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedBlogs(new Set()); // Clear selections when changing pages
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    setSelectedBlogs(new Set()); // Clear selections
  };

  const handleArchiveBlog = async (blogId: number) => {
    try {
      const response = await fetch("/api/archived", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: blogId }),
      });

      if (response.ok) {
        // Remove from selected blogs
        setSelectedBlogs((prev) => {
          const newSelected = new Set(prev);
          newSelected.delete(blogId);
          return newSelected;
        });

        // Refetch current page data
        await fetchBlogs(currentPage, itemsPerPage);
      } else {
        throw new Error("Failed to archive blog");
      }
    } catch (err) {
      console.error("Error archiving blog:", err);
      setError("Failed to archive blog. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className={`block overflow-hidden shadow mt-15 ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading blogs...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`block overflow-hidden shadow ${className}`}>
        <div className="p-8 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => fetchBlogs(currentPage, itemsPerPage)}
            className="mt-4 px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const allSelected =
    selectedBlogs.size === blogData.length && blogData.length > 0;
  const someSelected =
    selectedBlogs.size > 0 && selectedBlogs.size < blogData.length;

  return (
    <div className={`block overflow-hidden shadow ${className}`}>
      <div className="p-4 pt-20 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700">
        <div className="w-full mb-1">
          <div className="mb-4"></div>
          <div className="sm:flex">
            <div className="flex items-center justify-between space-x-2 sm:space-x-3 w-full">
              <h3 className="text-5xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
                Blogs
              </h3>
              <div className="flex items-center space-x-2">
                <a
                  href="/admin/blog/new-post"
                  className="inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm
                  font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800
                  focus:ring-4 focus:ring-primary-300 sm:w-auto dark:bg-primary-600 dark:hover:bg-primary-700
                  dark:focus:ring-primary-800 btn-primary"
                >
                  <svg
                    className="w-5 h-5 mr-2 -ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  New Post
                </a>
                <a
                  href="/admin/blog/archived"
                  className="inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm
                  font-medium text-center text-white rounded-lg bg-red-400 hover:bg-red-500
                  focus:ring-4 focus:ring-gray-300 sm:w-auto dark:bg-gray-600 dark:hover:bg-gray-700
                  dark:focus:ring-gray-800 btn-secondary"
                >
                  <TrashIcon className="w-5 h-5 mr-2" />
                  Archived
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full w-full align-middle">
            <div className="overflow-hidden shadow">
              <table className="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="p-4">
                      <div className="flex items-center">
                        <input
                          id="checkbox-all"
                          type="checkbox"
                          checked={allSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = someSelected;
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="checkbox-all" className="sr-only">
                          checkbox
                        </label>
                      </div>
                    </th>
                    <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Author
                    </th>
                    <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Is Featured
                    </th>
                    <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Title
                    </th>
                    <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Excerpt
                    </th>
                    <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Status
                    </th>
                    <th className="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {blogData.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="w-4 p-4">
                        <div className="flex items-center">
                          <input
                            id={`checkbox-${post.id}`}
                            type="checkbox"
                            checked={selectedBlogs.has(post.id)}
                            onChange={(e) =>
                              handleSelectBlog(post.id, e.target.checked)
                            }
                            className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                          />
                          <label
                            htmlFor={`checkbox-${post.id}`}
                            className="sr-only"
                          >
                            checkbox
                          </label>
                        </div>
                      </td>
                      <td className="flex items-center p-4 mr-12 space-x-2">
                        <img
                          className="w-10 h-10 rounded-full"
                          src={post.avatar_url}
                          alt={post.full_name}
                        />
                        <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          <div className="text-base font-semibold text-gray-900 dark:text-white">
                            {post.full_name}
                          </div>
                          <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            {post.email}
                          </div>
                        </div>
                      </td>
                      <td className="text-sm font-bold">
                        {post.isFeatured ? (
                          <span className="text-primary-400">Featured</span>
                        ) : (
                          <span className="text-accent-400">Regular</span>
                        )}
                      </td>
                      <td className="p-4 text-base text-gray-500">
                        <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          <div className="text-base font-semibold text-gray-900 dark:text-white">
                            {post.title}
                          </div>
                          <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            {post.slug.substring(0, 30)}...
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-base font-base text-gray-900">
                        {post.excerpt.substring(0, 60)}...
                      </td>
                      <td className="p-4 text-base font-normal text-gray-900 whitespace-nowrap dark:text-white">
                        <div className="flex items-center text-sm font-bold">
                          <div
                            className={`h-2.5 w-2.5 rounded-full mr-2 ${
                              post.status === "published"
                                ? "bg-green-400"
                                : "bg-red-500"
                            }`}
                          />
                          {post.status}
                        </div>
                      </td>
                      <td className="p-4 space-x-2 whitespace-nowrap flex">
                        <a
                          href={`/admin/blog/edit/${post.id.toString()}`}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                            <path
                              fillRule="evenodd"
                              d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </a>
                        <button
                          onClick={() => handleArchiveBlog(post.id)}
                          className="cursor-pointer inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <NavPagination
        currentPage={currentPage}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default BlogManagement;
