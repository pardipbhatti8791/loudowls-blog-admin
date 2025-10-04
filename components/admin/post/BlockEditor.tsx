"use client";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { Menu } from "@mantine/core";

const BlockNoteView = lazy(() =>
  import("@blocknote/mantine").then((mod) => ({ default: mod.BlockNoteView })),
);
import {
  DragHandleButton,
  SideMenu,
  SideMenuController,
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  type DefaultReactSuggestionItem,
  createReactBlockSpec,
} from "@blocknote/react";
import { type PartialBlock, type Block, defaultProps } from "@blocknote/core";
import { RemoveBlockButton } from "./RemoveBlockButton";
import { MediaPickerDialog } from "@/components/admin/MediaPickerDialog";
import {
  MdCircle,
  MdSquare,
  MdStar,
  MdArrowRight,
  MdCheckBox,
  MdRadioButtonUnchecked,
  MdDiamond,
} from "react-icons/md";

type EditorWrapperProps = {
  setBlogContent: (content: PartialBlock[]) => void;
  blogContent?: PartialBlock[];
};

function removeByKeys(
  arr: DefaultReactSuggestionItem[],
  titleToRemove: string[],
): DefaultReactSuggestionItem[] {
  return arr.filter((item) => !titleToRemove.includes(item.title));
}

function insertAtIndex(
  arr: DefaultReactSuggestionItem[],
  index: number,
  item: DefaultReactSuggestionItem,
): DefaultReactSuggestionItem[] {
  return [...arr.slice(0, index), item, ...arr.slice(index)];
}

const bulletTypes = [
  {
    title: "Circle",
    value: "circle",
    icon: MdCircle,
    color: "#333333",
  },
  {
    title: "Square",
    value: "square",
    icon: MdSquare,
    color: "#666666",
  },
  {
    title: "Star",
    value: "star",
    icon: MdStar,
    color: "#ff6b35",
  },
  {
    title: "Arrow",
    value: "arrow",
    icon: MdArrowRight,
    color: "#007bff",
  },
  {
    title: "Checkbox",
    value: "checkbox",
    icon: MdCheckBox,
    color: "#28a745",
  },
  {
    title: "Radio",
    value: "radio",
    icon: MdRadioButtonUnchecked,
    color: "#6f42c1",
  },
  {
    title: "Diamond",
    value: "diamond",
    icon: MdDiamond,
    color: "#e83e8c",
  },
];

// Custom bullet functionality temporarily disabled due to TypeScript issues
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _CustomBulletPoint = createReactBlockSpec(
  {
    type: "customBullet",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      bulletType: {
        default: "circle",
        values: [
          "circle",
          "square",
          "star",
          "arrow",
          "checkbox",
          "radio",
          "diamond",
          "custom",
        ],
      },
      bulletIcon: {
        default: "",
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const bulletType = bulletTypes.find(
        (b) => b.value === props.block.props.bulletType,
      );
      const BulletIcon = bulletType?.icon || MdCircle;
      const hasCustomIcon =
        props.block.props.bulletIcon &&
        props.block.props.bulletType === "custom";

      const handleKeyDown = (e: React.KeyboardEvent) => {
        // Custom bullet functionality disabled due to TypeScript issues
        if (e.key === "Enter" && props.block.type === "customBullet") {
          e.preventDefault();
          e.stopPropagation();
          console.log("Custom bullet Enter key handling disabled");
        }
      };

      const handleClick = (e: React.MouseEvent) => {
        if (
          e.currentTarget.closest(".custom-bullet-container[data-bullet-type]")
        ) {
          const contentElement = e.currentTarget
            .closest(".custom-bullet-container")
            ?.querySelector('[contenteditable="true"]') as HTMLElement;
          if (contentElement) {
            contentElement.focus();
          }
        }
      };

      return (
        <div
          className="custom-bullet-container"
          data-bullet-type={props.block.props.bulletType}
          data-block-type="customBullet"
          onClick={handleClick}
        >
          <Menu withinPortal={false}>
            <Menu.Target>
              <div className="bullet-icon-wrapper" contentEditable={false}>
                {hasCustomIcon ? (
                  <img
                    src={props.block.props.bulletIcon}
                    alt="Custom bullet"
                    className="bullet-icon custom-bullet-image"
                    style={{
                      width: "16px",
                      height: "16px",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <BulletIcon
                    className="bullet-icon"
                    style={{ color: bulletType?.color || "#333333" }}
                    size={16}
                  />
                )}
              </div>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Bullet Type</Menu.Label>
              <Menu.Divider />
              {bulletTypes.map((type) => {
                const ItemIcon = type.icon;
                return (
                  <Menu.Item
                    key={type.value}
                    leftSection={
                      <ItemIcon
                        className="bullet-icon"
                        style={{ color: type.color }}
                        size={14}
                      />
                    }
                    onClick={() => {
                      // Custom bullet functionality disabled due to TypeScript issues
                      console.log("Custom bullet update disabled");
                    }}
                  >
                    {type.title}
                  </Menu.Item>
                );
              })}
              <Menu.Divider />
              <Menu.Item
                leftSection={<span>🖼️</span>}
                onClick={() => {
                  const event = new CustomEvent("openBulletMediaPicker", {
                    detail: { block: props.block },
                  });
                  window.dispatchEvent(event);
                }}
              >
                Choose from Media
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <div
            className="bullet-content"
            ref={props.contentRef}
            onKeyDown={handleKeyDown}
            style={{ display: "inline-block", width: "100%" }}
          />
        </div>
      );
    },

    toExternalHTML: (props) => {
      const bulletType = bulletTypes.find(
        (b) => b.value === props.block.props.bulletType,
      );
      const BulletIcon = bulletType?.icon || MdCircle;
      const hasCustomIcon =
        props.block.props.bulletIcon &&
        props.block.props.bulletType === "custom";

      return (
        <div
          className="custom-bullet-container"
          data-bullet-type={props.block.props.bulletType}
          data-block-type="customBullet"
        >
          <div className="bullet-icon-wrapper">
            {hasCustomIcon ? (
              <img
                src={props.block.props.bulletIcon}
                alt="Custom bullet"
                className="bullet-icon custom-bullet-image"
                style={{ width: "16px", height: "16px", objectFit: "contain" }}
              />
            ) : (
              <BulletIcon
                className="bullet-icon"
                style={{ color: bulletType?.color || "#333333" }}
                size={16}
              />
            )}
          </div>
          <div className="bullet-content" ref={props.contentRef} />
        </div>
      );
    },
  },
);

export default function EditorWrapper({
  setBlogContent,
  blogContent,
}: EditorWrapperProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showBulletMediaPicker, setShowBulletMediaPicker] = useState(false);
  const [currentBulletBlock, setCurrentBulletBlock] = useState<Block | null>(
    null,
  );
  const [isMounted, setIsMounted] = useState(false);

  const editor = useCreateBlockNote({
    initialContent: blogContent || undefined,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (editor && isMounted) {
      const content = editor.document;
      setBlogContent(content);
    }
  }, [editor, isMounted, setBlogContent]);

  useEffect(() => {
    const handleBulletMediaPicker = (event: CustomEvent) => {
      setCurrentBulletBlock(event.detail.block);
      setShowBulletMediaPicker(true);
    };

    if (typeof window !== "undefined") {
      window.addEventListener(
        "openBulletMediaPicker",
        handleBulletMediaPicker as EventListener,
      );
      return () => {
        window.removeEventListener(
          "openBulletMediaPicker",
          handleBulletMediaPicker as EventListener,
        );
      };
    }
  }, []);

  const handleEditorChange = useCallback(() => {
    const content = editor.document;
    setBlogContent(content);
  }, [editor, setBlogContent]);

  const handleMediaSelect = useCallback(
    (url: string) => {
      editor.insertBlocks(
        [
          {
            type: "image",
            props: {
              url: url,
            },
          },
        ],
        editor.getTextCursorPosition().block,
        "after",
      );
      setShowMediaPicker(false);
    },
    [editor],
  );

  const handleBulletIconSelect = useCallback(
    (_url: string) => {
      if (currentBulletBlock) {
        // Custom bullet functionality disabled due to TypeScript issues
        console.log("Custom bullet icon update disabled");
      }
      setShowBulletMediaPicker(false);
      setCurrentBulletBlock(null);
    },
    [currentBulletBlock],
  );

  const getCustomSlashMenuItems = useCallback(
    async (query: string) => {
      const defaultItems = getDefaultReactSlashMenuItems(editor);
      let newItems = removeByKeys(defaultItems, ["Image", "File", "Audio"]);

      const mediaPickerItem: DefaultReactSuggestionItem = {
        title: "Media Library",
        onItemClick: () => {
          setShowMediaPicker(true);
        },
        aliases: ["media", "image", "library", "gallery", "photo", "picture"],
        group: "Image Picker",
        icon: <span>📷</span>,
        subtext: "Select an image from your media library",
      };

      newItems = insertAtIndex(newItems, 11, mediaPickerItem);

      if (!query) {
        return newItems;
      }

      return newItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.aliases?.some((alias) =>
            alias.toLowerCase().includes(query.toLowerCase()),
          ),
      );
    },
    [editor],
  );

  if (!isMounted) {
    return (
      <div
        style={{
          minHeight: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          padding: "10px",
        }}
      >
        <div>Loading editor...</div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <BlockNoteView
        // @ts-expect-error BlockNote type mismatch
        editor={editor}
        theme={"light"}
        editable={true}
        onChange={handleEditorChange}
        style={{
          minHeight: "500px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          padding: "10px",
        }}
        slashMenu={false}
      >
        <SideMenuController
          sideMenu={(props) => (
            <SideMenu {...props}>
              <RemoveBlockButton {...props} />
              <DragHandleButton {...props} />
            </SideMenu>
          )}
        />
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={getCustomSlashMenuItems}
        />
      </BlockNoteView>

      <MediaPickerDialog
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        title="Select Image from Library"
        allowedTypes={["image/*"]}
      />

      <MediaPickerDialog
        isOpen={showBulletMediaPicker}
        onClose={() => {
          setShowBulletMediaPicker(false);
          setCurrentBulletBlock(null);
        }}
        onSelect={handleBulletIconSelect}
        title="Select Bullet Icon from Library"
        allowedTypes={["image/*"]}
      />
    </Suspense>
  );
}

