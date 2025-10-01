import {
  createReactBlockSpec,
} from "@blocknote/react";
import { RiImageFill } from "react-icons/ri";
import React, { useState } from "react";
import { MediaPickerDialog } from "@/components/admin/MediaPickerDialog";

// Define the block props
export const MediaImageBlock = createReactBlockSpec(
  {
    type: "mediaImage",
    propSchema: {
      src: {
        default: "",
      },
      alt: {
        default: "Image",
      },
      width: {
        default: "auto",
      },
      caption: {
        default: "",
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const [showMediaPicker, setShowMediaPicker] = useState(false);
      const [showCaptionInput, setShowCaptionInput] = useState(false);

      const handleImageSelect = (url: string) => {
        props.editor.updateBlock(props.block, {
          props: {
            ...props.block.props,
            src: url,
          },
        });
        setShowMediaPicker(false);
      };

      const handleCaptionChange = (caption: string) => {
        props.editor.updateBlock(props.block, {
          props: {
            ...props.block.props,
            caption,
          },
        });
      };

      const handleWidthChange = (width: string) => {
        props.editor.updateBlock(props.block, {
          props: {
            ...props.block.props,
            width,
          },
        });
      };

      const handleAltChange = (alt: string) => {
        props.editor.updateBlock(props.block, {
          props: {
            ...props.block.props,
            alt,
          },
        });
      };

      return (
        <div className="media-image-block">
          {!props.block.props.src ? (
            // Empty state - show media picker button
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <RiImageFill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <button
                onClick={() => setShowMediaPicker(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Select Image from Library
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Choose an image from your media library
              </p>
            </div>
          ) : (
            // Image selected state
            <div className="space-y-3">
              <div className="relative group">
                <img
                  src={props.block.props.src}
                  alt={props.block.props.alt}
                  style={{
                    width: props.block.props.width === "auto" ? "100%" : props.block.props.width,
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "8px",
                  }}
                />
                {/* Image overlay controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowMediaPicker(true)}
                      className="px-3 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm"
                    >
                      Change Image
                    </button>
                    <button
                      onClick={() => setShowCaptionInput(!showCaptionInput)}
                      className="px-3 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm"
                    >
                      {props.block.props.caption ? "Edit Caption" : "Add Caption"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Image controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Width
                  </label>
                  <select
                    value={props.block.props.width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="auto">Auto</option>
                    <option value="25%">25%</option>
                    <option value="50%">50%</option>
                    <option value="75%">75%</option>
                    <option value="100%">100%</option>
                    <option value="300px">Small (300px)</option>
                    <option value="500px">Medium (500px)</option>
                    <option value="800px">Large (800px)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={props.block.props.alt}
                    onChange={(e) => handleAltChange(e.target.value)}
                    placeholder="Image description"
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Actions
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCaptionInput(!showCaptionInput)}
                      className="px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                      Caption
                    </button>
                    <button
                      onClick={() => {
                        props.editor.updateBlock(props.block, {
                          props: {
                            src: "",
                            alt: "Image",
                            width: "auto",
                            caption: "",
                          },
                        });
                      }}
                      className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Caption input */}
              {showCaptionInput && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Caption
                  </label>
                  <textarea
                    value={props.block.props.caption}
                    onChange={(e) => handleCaptionChange(e.target.value)}
                    placeholder="Enter image caption..."
                    rows={2}
                    className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Display caption if exists */}
              {props.block.props.caption && !showCaptionInput && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 italic">
                    {props.block.props.caption}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Media Picker Dialog */}
          <MediaPickerDialog
            isOpen={showMediaPicker}
            onClose={() => setShowMediaPicker(false)}
            onSelect={handleImageSelect}
            title="Select Image from Library"
            allowedTypes={["image/*"]}
          />
        </div>
      );
    },
  }
);

// Note: Slash menu integration can be added later once the basic block is working