'use client'
import React, { useState, useEffect, useCallback } from "react";
import { Upload, Image as ImageIcon, FileText, Film, Music, X, Search, Grid, List, Download, Trash2, Copy, CheckCircle, Save, Edit3, Plus } from "lucide-react";

interface MediaFile {
  id: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  url: string;
  alt?: string;
  description?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createdAt: string;
  metadata: {
    media_id: string;
    alt: string;
    name: string;
    description: string;
  };
}

export const MediaManager: React.FC = () => {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [savingUploads, setSavingUploads] = useState(false);
  
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [editableData, setEditableData] = useState({
    media_id: '',
    alt: '',
    name: '',
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const itemsPerPage = 20;

  // Fetch media with pagination
  const fetchMedia = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(`/api/media?page=${page}&limit=${itemsPerPage}`);
      const data = await response.json();
      
      if (data.media) {
        if (append) {
          setMedia(prev => [...prev, ...data.media]);
        } else {
          setMedia(data.media);
        }
        setHasMore(data.pagination?.hasMore || false);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchMedia(1);
  }, []);

  // Load more function
  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchMedia(nextPage, true);
  };

// Handle file upload
  const handleMediaSelect = async (file: MediaFile) => {
    setSelectedMedia(file);
    
    try {
      const response = await fetch(`/api/blogs-media/${file.id}`);
      if (response.ok) {
        const metadata = await response.json();
        setEditableData({
          media_id: file.id,
          alt: metadata.alt || '',
          name: metadata.name || file.name,
          description: metadata.description || ''
        });
      } else {
        setEditableData({
          media_id: file.id,
          alt: '',
          name: file.name,
          description: ''
        });
      }
    } catch (error) {
      setEditableData({
        media_id: file.id,
        alt: '',
        name: file.name,
        description: ''
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof typeof editableData, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!selectedMedia) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/blogs-media/${selectedMedia.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editableData.name,
          alt: editableData.alt,
          description: editableData.description
        }),
      });

      if (response.ok) {
        const updatedFile = await response.json();
        
        setMedia(prev => prev.map(file => 
          file.id === selectedMedia.id ? { ...file, ...updatedFile } : file
        ));
        
        setSelectedMedia(prev => prev ? { ...prev, ...updatedFile } : null);
        setIsEditing(false);
        
        fetchMedia(1, false);
      }
    } catch (error) {
      console.error("Error updating media:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (selectedMedia) {
      try {
        const response = await fetch(`/api/blogs-media/${selectedMedia.id}`);
        if (response.ok) {
          const metadata = await response.json();
          setEditableData({
            media_id: selectedMedia.id,
            alt: metadata.alt || '',
            name: metadata.name || selectedMedia.name,
            description: metadata.description || ''
          });
        } else {
          setEditableData({
            media_id: selectedMedia.id,
            alt: '',
            name: selectedMedia.name,
            description: ''
          });
        }
      } catch (error) {
        setEditableData({
          media_id: selectedMedia.id,
          alt: '',
          name: selectedMedia.name,
          description: ''
        });
      }
    }
    setIsEditing(false);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
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
            return {
              id: data.id || `temp_${Date.now()}_${Math.random()}`,
              name: data.name || file.name,
              size: file.size,
              type: file.type,
              url: data.publicUrl,
              createdAt: new Date().toISOString(),
              metadata: {
                media_id: data.id || `temp_${Date.now()}_${Math.random()}`,
                alt: '',
                name: file.name,
                description: ''
              }
            };
          }
        } catch (error) {
          console.error("Error uploading file:", error);
        }
        return null;
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean) as UploadedFile[];
      
      setUploadedFiles(prev => [...prev, ...successfulUploads]);
    } catch (error) {
      console.error("Error processing uploads:", error);
    } finally {
      setUploading(false);
    }
  };

  const updateUploadedFileMetadata = (fileId: string, field: string, value: string) => {
    setUploadedFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { 
            ...file, 
            metadata: { 
              ...file.metadata, 
              [field]: value 
            }
          }
        : file
    ));
  };

  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const saveUploadedFiles = async () => {
    if (uploadedFiles.length === 0) return;

    setSavingUploads(true);
    
    try {
      const metadataPromises = uploadedFiles.map(async (uploadedFile) => {
        const response = await fetch("/api/blogs-media", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            media_id: uploadedFile.metadata.media_id,
            name: uploadedFile.metadata.name,
            alt: uploadedFile.metadata.alt,
            description: uploadedFile.metadata.description,
          }),
        });

        if (!response.ok) {
          throw new Error('Metadata save failed');
        }

        return await response.json();
      });

      await Promise.all(metadataPromises);
      
      setUploadedFiles([]);
      
      setCurrentPage(1);
      fetchMedia(1, false);
      
    } catch (error) {
      console.error("Error saving metadata:", error);
    } finally {
      setSavingUploads(false);
    }
  };

  const cancelUploadedFiles = () => {
    setUploadedFiles([]);
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

  // Filter media based on search and ensure each item has a valid ID
  const filteredMedia = media
    .filter((file) => file && file.id) // Filter out items with null/undefined IDs
    .filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  // Reset to first page when search changes
  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
       // For search, we might want to fetch all items, or implement server-side search
      // For now, we'll filter client-side from loaded items
    }
  }, [searchTerm]);

  return (
    <div className="container mt-24 mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Media Library</h1>
        <p className="text-gray-600">Manage and organize your uploaded files</p>
      </div>

      {/* Upload Section */}
      <div
        className={`mb-8 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <span className="text-lg font-medium text-gray-700">
            {uploading ? "Uploading..." : "Drop files here or click to upload"}
          </span>
          <span className="text-sm text-gray-500 mt-2">
            Supports images, videos, audio, and documents
          </span>
        </label>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Review & Save Uploads ({uploadedFiles.length})
                </h3>
                <p className="text-sm text-gray-500">
                  Add metadata and save your uploaded files
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={cancelUploadedFiles}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel All
              </button>
              <button
                onClick={saveUploadedFiles}
                disabled={savingUploads}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {savingUploads ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save All Files
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex gap-4">
                  <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {uploadedFile.type.startsWith("image") ? (
                      <img
                        src={uploadedFile.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : uploadedFile.type.startsWith("video") ? (
                      <video
                        src={uploadedFile.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : uploadedFile.type.startsWith("audio") ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <Music className="w-8 h-8 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        {getFileIcon(uploadedFile.type)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Media ID
                      </label>
                      <input
                        type="text"
                        value={uploadedFile.metadata.media_id}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={uploadedFile.metadata.name}
                        onChange={(e) => updateUploadedFileMetadata(uploadedFile.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        placeholder="Enter file name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alt Text
                      </label>
                      <input
                        type="text"
                        value={uploadedFile.metadata.alt}
                        onChange={(e) => updateUploadedFileMetadata(uploadedFile.id, 'alt', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        placeholder="Alternative text for accessibility"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={uploadedFile.metadata.description}
                        onChange={(e) => updateUploadedFileMetadata(uploadedFile.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none"
                        rows={2}
                        placeholder="Enter description"
                      />
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      onClick={() => removeUploadedFile(uploadedFile.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Size: {formatFileSize(uploadedFile.size)}</span>
                    <span>Type: {uploadedFile.type}</span>
                    <span>Uploaded: {new Date(uploadedFile.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedMedia && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Edit3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Edit Media Details
                </h3>
                <p className="text-sm text-gray-500">
                  Update metadata for selected media file
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMedia(null)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Close edit panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex gap-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {selectedMedia.type.startsWith("image") ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.name}
                    className="w-full h-full object-cover"
                  />
                ) : selectedMedia.type.startsWith("video") ? (
                  <video
                    src={selectedMedia.url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : selectedMedia.type.startsWith("audio") ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <Music className="w-8 h-8 text-gray-400" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    {getFileIcon(selectedMedia.type)}
                  </div>
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Media ID
                  </label>
                  <input
                    type="text"
                    value={editableData.media_id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editableData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter file name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={editableData.alt}
                    onChange={(e) => handleInputChange('alt', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Alternative text for accessibility"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editableData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    rows={2}
                    placeholder="Enter description"
                  />
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded ${
              viewMode === "list"
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Media Grid/List */}
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
              key={file.id || `file-${file.name}-${file.createdAt}`}
              className={`group relative bg-white rounded-lg border-2 overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                selectedMedia?.id === file.id 
                  ? 'border-primary-500 shadow-lg ring-2 ring-primary-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleMediaSelect(file)}
            >
              <div className="aspect-square relative bg-gray-50">
                {file.type.startsWith("image") ? (
                  <img
                    src={file.url}
                    alt={file.alt || file.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {getFileIcon(file.type)}
                  </div>
                )}
                
                {selectedMedia?.id === file.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMediaSelect(file);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="Edit Details"
                    >
                      <Edit3 className="w-4 h-4 text-gray-700" />
                    </button>
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
                {file.alt && (
                  <p className="text-xs text-gray-400 mt-1 truncate" title={file.alt}>
                    Alt: {file.alt}
                  </p>
                )}
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
                  Alt Text
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
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
                  key={file.id || `file-${file.name}-${file.createdAt}`} 
                  className={`cursor-pointer transition-colors ${
                    selectedMedia?.id === file.id 
                      ? 'bg-primary-50 border-l-4 border-primary-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleMediaSelect(file)}
                >
                  <td className="px-4 py-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                        {file.type.startsWith("image") ? (
                          <img
                            src={file.url}
                            alt={file.alt || file.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          getFileIcon(file.type)
                        )}
                      </div>
                      {selectedMedia?.id === file.id && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs" title={file.name}>
                        {file.name}
                      </p>
                      {file.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs mt-1" title={file.description}>
                          {file.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-500 truncate max-w-xs" title={file.alt || 'No alt text'}>
                      {file.alt || <span className="text-gray-400 italic">No alt text</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {file.type.split('/')[0]}
                    </span>
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
                        className="p-1 text-gray-600 hover:text-primary-500 transition-colors"
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
                        className="p-1 text-gray-600 hover:text-primary-500 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMediaSelect(file);
                        }}
                        className="p-1 text-gray-600 hover:text-primary-500 transition-colors"
                        title="Edit Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
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
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>Load More</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};