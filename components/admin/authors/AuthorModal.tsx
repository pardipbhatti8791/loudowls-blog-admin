'use client'
import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Button } from "../../ui/button";
import { Author, authorsApi, CreateAuthorForm } from "@/lib/authors-api";
import { Textarea } from "@/components/ui/textarea";
interface AuthorModalProps {
  author: Author | null;
  onClose: () => void;
  onSave: () => void;
}

const AuthorModal: React.FC<AuthorModalProps> = ({
  author,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<CreateAuthorForm>({
    name: "",
    designation: "",
    description: "",
    profile_photo: "",
    active: true,
    email: "",
    bio: "",
    social_links: {},
  });
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (author) {
      setForm({
        name: author.name,
        designation: author.designation || "",
        description: author.description || "",
        profile_photo: author.profile_photo || "",
        active: author.active,
        email: author.email || "",
        bio: author.bio || "",
        social_links: author.social_links || {},
      });
      setImagePreview(author.profile_photo || "");
    }
  }, [author]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setForm((prev) => ({ ...prev, profile_photo: result.publicUrl }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name) {
      toast.error("Name is required");
      return;
    }

    try {
      setLoading(true);
      if (author) {
        await authorsApi.updateAuthor(author.id, form);
        toast.success("Author updated successfully");
      } else {
        await authorsApi.createAuthor(form);
        toast.success("Author created successfully");
      }
      onSave();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save author");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {author ? "Edit Author" : "Add Author"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Photo */}
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <Label>Profile Photo</Label>
              <div className="mt-2 relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                  {imagePreview ? (
                    <div className="w-full h-full relative">
                      {isUploading && (
                        <svg
                          className="absolute top-[42%] left-[38%] animate-spin h-8 w-8 text-primary-400"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Upload className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={form.designation}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      designation: e.target.value,
                    }))
                  }
                  placeholder="Senior Developer"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Input
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="A brief one-line description"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              rows={4}
              placeholder="Detailed biography..."
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <Label>Social Links</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Facebook className="w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Facebook URL"
                  value={form.social_links?.facebook || ""}
                  onChange={(e) =>
                    handleSocialLinkChange("facebook", e.target.value)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Twitter className="w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Twitter URL"
                  value={form.social_links?.twitter || ""}
                  onChange={(e) =>
                    handleSocialLinkChange("twitter", e.target.value)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-gray-400" />
                <Input
                  placeholder="LinkedIn URL"
                  value={form.social_links?.linkedin || ""}
                  onChange={(e) =>
                    handleSocialLinkChange("linkedin", e.target.value)
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Instagram URL"
                  value={form.social_links?.instagram || ""}
                  onChange={(e) =>
                    handleSocialLinkChange("instagram", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, active: e.target.checked }))
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <Label htmlFor="active" className="cursor-pointer">
              Active (Author will be visible publicly)
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || isUploading}>
              {loading ? "Saving..." : author ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthorModal;

