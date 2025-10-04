'use client'
import React, { useState, useEffect, useCallback } from "react";
import {
  TrashIcon,
  Search,
  X,
  Plus,
  Edit,
  Eye,
  Calendar,
  Filter,
  CheckCircle,
  Clock,
  Archive,
} from "lucide-react";
import NavPagination from "./Navigation";
import Link from "next/link";

export interface Blog {
  id: string;
  name: string;
  profile_photo: string;
  designation: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnail: string;
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  user_id?: string;
  created_at?: string;
}

export interface Author {
  id: string;
  name: string;
  designation: string;
  profile_photo: string;
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
  const [selectedBlogs, setSelectedBlogs] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [, setTotalPages] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchBlogs = useCallback(async (
    page: number = currentPage,
    limit: number = itemsPerPage,
    search: string = "",
    authorId: string = "",
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (authorId.trim()) {
        params.append("author_id", authorId.trim());
      }

      const response = await fetch(`/api/blogs?${params.toString()}`);

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
    fetchBlogs(currentPage, itemsPerPage, debouncedSearchTerm, selectedAuthor);
  }, [currentPage, itemsPerPage, debouncedSearchTerm, selectedAuthor, fetchBlogs]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, selectedAuthor, currentPage]);

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBlogs(new Set(blogData.map((blog) => blog.id)));
    } else {
      setSelectedBlogs(new Set());
    }
  };

  const handleSelectBlog = (blogId: string, checked: boolean) => {
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
    setSelectedBlogs(new Set());
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    setSelectedBlogs(new Set());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedBlogs(new Set());
  };

  const handleAuthorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAuthor(e.target.value);
    setSelectedBlogs(new Set());
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedAuthor("");
    setSelectedBlogs(new Set());
  };

  const hasActiveFilters = searchTerm.trim() || selectedAuthor.trim();

  const handleArchiveBlog = async (blogId: string) => {
    try {
      const response = await fetch("/api/archived", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: blogId }),
      });

      if (response.ok) {
        setSelectedBlogs((prev) => {
          const newSelected = new Set(prev);
          newSelected.delete(blogId);
          return newSelected;
        });
        await fetchBlogs(
          currentPage,
          itemsPerPage,
          debouncedSearchTerm,
          selectedAuthor,
        );
      } else {
        throw new Error("Failed to archive blog");
      }
    } catch (err) {
      console.error("Error archiving blog:", err);
      setError("Failed to archive blog. Please try again.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "draft":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "archived":
        return <Archive className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium";
    switch (status) {
      case "published":
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case "draft":
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case "archived":
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200`;
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 ${className}`}
      >
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Loading blogs...
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please wait while we fetch your content
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-white dark:bg-gray-900 shadow-sm border border-red-200 dark:border-red-800 ${className}`}
      >
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <X className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() =>
              fetchBlogs(
                currentPage,
                itemsPerPage,
                debouncedSearchTerm,
                selectedAuthor,
              )
            }
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            Try Again
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
    <div className={`space-y-6 mt-24 ${className}`}>
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Blog Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and organize your blog posts
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/admin/blog/archived"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <Archive className="w-4 h-4 mr-2" />
              Archived ({totalItems > 0 ? Math.floor(totalItems * 0.1) : 0})
            </a>

            <a
              href="/admin/blog/new-post"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </a>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search blogs by title, excerpt, or author..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary transition-colors duration-200"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedAuthor}
                onChange={handleAuthorChange}
                disabled={authorsLoading}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white transition-colors duration-200"
              >
                <option value="">All Authors</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm.trim() && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                Search: &quot;{searchTerm}&quot;
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-primary hover:bg-primary/20 transition-colors duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedAuthor.trim() && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-secondary/10 text-secondary border border-secondary/20">
                Author: {authors.find((a) => a.id === selectedAuthor)?.name}
                <button
                  onClick={() => setSelectedAuthor("")}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-secondary hover:bg-secondary/20 transition-colors duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <input
                  id="select-all"
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-600"
                />
                <label
                  htmlFor="select-all"
                  className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Select All
                </label>
              </div>

              {selectedBlogs.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedBlogs.size} selected
                  </span>
                  <button className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium">
                    Delete Selected
                  </button>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {totalItems} total posts
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {blogData.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {hasActiveFilters ? "No blogs found" : "No blogs available"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {hasActiveFilters
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first blog post"}
              </p>
              {!hasActiveFilters && (
                <a
                  href="/admin/blog/new-post"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Post
                </a>
              )}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {blogData.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        id={`select-${post.id}`}
                        type="checkbox"
                        checked={selectedBlogs.has(post.id)}
                        onChange={(e) =>
                          handleSelectBlog(post.id, e.target.checked)
                        }
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-600"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <img
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                            src={
                              post.thumbnail ||
                              `https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80`
                            }
                            alt={post.title}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {post.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-400">
                            <Calendar className="w-3 h-3 mr-1" />
                            {post.created_at
                              ? new Date(post.created_at).toLocaleDateString()
                              : "No date"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          className="w-8 h-8 rounded-full object-cover"
                          src={post.profile_photo}
                          alt={post.name}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {post.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {post.designation}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(post.status)}>
                        {getStatusIcon(post.status)}
                        <span className="ml-1.5 capitalize">{post.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {post.isFeatured ? (
                        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          ⭐ Featured
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <a
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center p-2 text-gray-400 hover:text-primary border border-gray-200 hover:border-primary rounded-lg hover:bg-primary/5 transition-all duration-200 dark:border-gray-700 dark:hover:border-primary"
                          title="View Post"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/admin/blog/edit/${post.id}`}
                          className="inline-flex items-center p-2 text-gray-400 hover:text-primary border border-gray-200 hover:border-primary rounded-lg hover:bg-primary/5 transition-all duration-200 dark:border-gray-700 dark:hover:border-primary"
                          title="Edit Post"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleArchiveBlog(post.id)}
                          className="inline-flex items-center p-2 text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded-lg hover:bg-red-50 transition-all duration-200 dark:border-gray-700 dark:hover:border-red-600 dark:hover:bg-red-900/20"
                          title="Archive Post"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800">
            <NavPagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
