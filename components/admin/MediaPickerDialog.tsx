'use client'
import React, { useState, useEffect, useCallback } from "react";
import { X, Upload, Image as ImageIcon, FileText, Film, Music, Search, Grid, List, Copy, CheckCircle, Download } from "lucide-react";

interface MediaFile {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  url: string;
}

interface MediaPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
  allowedTypes?: string[];
}

export const MediaPickerDialog: React.FC<MediaPickerDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = "Select Media",
  allowedTypes = ["image/*"]
}) => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const itemsPerPage = 20;

  // Fetch media with pagination
  const fetchMedia = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      console.log("Fetching media from API...");
      const response = await fetch(`/api/media?page=${page}&limit=${itemsPerPage}`);
      const data = await response.json();
      
      console.log("API Response:", data);
      
      if (data.error) {
        console.error("API Error:", data.error);
      }
      
      if (data.media) {
        console.log("Media files found:", data.media.length);
        if (append) {
          setMedia(prev => [...prev, ...data.media]);
        } else {
          setMedia(data.media);
        }
        setHasMore(data.pagination?.hasMore || false);
      } else {
        console.log("No media data in response");
        setMedia([]);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia(1);
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Load more function
  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchMedia(nextPage, true);
  };

  // Handle file upload
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    });

    await Promise.all(uploadPromises);
    setUploading(false);
    // Reset to first page and refresh
    setCurrentPage(1);
    fetchMedia(1, false);
  };

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files);
    }
  }, []);

  // Copy URL to clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    if (type.startsWith("image")) return <ImageIcon className="w-5 h-5" />;
    if (type.startsWith("video")) return <Film className="w-5 h-5" />;
    if (type.startsWith("audio")) return <Music className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  // Filter media based on search and allowed types
  const filteredMedia = media.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = allowedTypes.some(allowedType => {
      if (allowedType === "image/*") return file.type.startsWith("image");
      if (allowedType === "video/*") return file.type.startsWith("video");
      if (allowedType === "audio/*") return file.type.startsWith("audio");
      return file.type === allowedType;
    });
    return matchesSearch && matchesType;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Upload Section */}
          <div
            className={`m-6 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="dialog-file-upload"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
              accept={allowedTypes.join(",")}
            />
            <label
              htmlFor="dialog-file-upload"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                {uploading ? "Uploading..." : "Drop files here or click to upload"}
              </span>
            </label>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-6 pb-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Media Grid/List */}
          <div className="flex-1 overflow-y-auto px-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No media files found</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredMedia.map((file) => (
                  <div
                    key={file.id}
                    className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => onSelect(file.url)}
                  >
                    <div className="aspect-square relative bg-gray-50">
                      {file.type.startsWith("image") ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(file.url);
                            }}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            title="Copy URL"
                          >
                            {copiedUrl === file.url ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-700" />
                            )}
                          </button>
                          <a
                            href={file.url}
                            download
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-gray-700" />
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preview
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMedia.map((file) => (
                      <tr
                        key={file.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => onSelect(file.url)}
                      >
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            {file.type.startsWith("image") ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              getFileIcon(file.type)
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs" title={file.name}>
                            {file.name}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(file.url);
                              }}
                              className="p-1 text-gray-600 hover:text-primary-500"
                              title="Copy URL"
                            >
                              {copiedUrl === file.url ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <a
                              href={file.url}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 text-gray-600 hover:text-primary-500"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Load More Button */}
            {!loading && hasMore && filteredMedia.length > 0 && (
              <div className="mt-6 text-center pb-6">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load More</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};