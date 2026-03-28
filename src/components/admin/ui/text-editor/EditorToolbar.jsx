// src/components/admin/ui/text-editor/EditorToolbar.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent, Link, Image, Table, Minus, Undo, Redo, Search, Quote,
  RemoveFormatting, ExternalLink, Heading, Palette, Highlighter, Code,
} from "lucide-react";
import ToolbarButton from "./ToolBarButton";
import ToolbarDivider from "./ToolBarDivider";

const COLORS = [
  "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", 
  "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#008000",
];

export default function EditorToolbar({
  execCommand,
  activeCommands,
  onShowLink,
  onShowImage,
  onShowTable,
  onToggleFindReplace,
  wordCount,
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  
  const toolbarRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setShowColorPicker(false);
        setShowHighlightPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={toolbarRef} className="p-3 shadow-md bg-background border-b border-slate-200 sticky top-0 z-10">
      <div className="flex flex-wrap items-center gap-1 max-w-7xl mx-auto">
        {/* Formatting */}
        <ToolbarButton onClick={() => execCommand("bold")} icon={Bold} title="Bold" commandName="bold" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("italic")} icon={Italic} title="Italic" commandName="italic" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("underline")} icon={Underline} title="Underline" commandName="underline" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("strikeThrough")} icon={Strikethrough} title="Strikethrough" commandName="strikethrough" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("removeFormat")} icon={RemoveFormatting} title="Clear Formatting" activeCommands={activeCommands} />
        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton 
          onClick={() => execCommand("formatBlock", "h2")} 
          icon={Heading} 
          title="Toggle Heading" 
          commandName={activeCommands.subheading ? "subheading" : "paragraph"} 
          activeCommands={activeCommands} 
        />
        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton onClick={() => execCommand("justifyLeft")} icon={AlignLeft} title="Left" commandName="justifyLeft" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("justifyCenter")} icon={AlignCenter} title="Center" commandName="justifyCenter" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("justifyRight")} icon={AlignRight} title="Right" commandName="justifyRight" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("justifyFull")} icon={AlignJustify} title="Justify" commandName="justifyFull" activeCommands={activeCommands} />
        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton onClick={() => execCommand("insertUnorderedList")} icon={List} title="Bullet List" commandName="insertUnorderedList" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("insertOrderedList")} icon={ListOrdered} title="Numbered List" commandName="insertOrderedList" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("indent")} icon={Indent} title="Indent" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("outdent")} icon={Outdent} title="Outdent" activeCommands={activeCommands} />
        <ToolbarDivider />

        {/* Colors */}
        <div className="relative">
          <ToolbarButton 
            onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); }} 
            icon={Palette} 
            title="Text Color" 
            activeCommands={activeCommands} 
          />
          {showColorPicker && (
            <ColorPopup
              colors={COLORS}
              onSelect={(c) => { execCommand("foreColor", c); setShowColorPicker(false); }}
              onClose={() => setShowColorPicker(false)}
            />
          )}
        </div>
        <div className="relative">
          <ToolbarButton 
            onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); }} 
            icon={Highlighter} 
            title="Highlight Color" 
            activeCommands={activeCommands} 
          />
          {showHighlightPicker && (
            <ColorPopup
              colors={COLORS}
              onSelect={(c) => { execCommand("backColor", c); setShowHighlightPicker(false); }}
              onClose={() => setShowHighlightPicker(false)}
            />
          )}
        </div>
        <ToolbarDivider />

        {/* Inserts */}
        <ToolbarButton onClick={onShowLink} icon={Link} title="Link" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("unlink")} icon={ExternalLink} title="Unlink" activeCommands={activeCommands} />
        <ToolbarButton onClick={onShowImage} icon={Image} title="Image" activeCommands={activeCommands} />
        <ToolbarButton onClick={onShowTable} icon={Table} title="Table" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("insertHorizontalRule")} icon={Minus} title="Divider" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("formatBlock", "blockquote")} icon={Quote} title="Blockquote" commandName="quote" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("formatBlock", "pre")} icon={Code} title="Code Block" commandName="code" activeCommands={activeCommands} />
        <ToolbarDivider />

        {/* History & Tools */}
        <ToolbarButton onClick={() => execCommand("undo")} icon={Undo} title="Undo" activeCommands={activeCommands} />
        <ToolbarButton onClick={() => execCommand("redo")} icon={Redo} title="Redo" activeCommands={activeCommands} />
        <ToolbarButton onClick={onToggleFindReplace} icon={Search} title="Find & Replace" activeCommands={activeCommands} />

        <div className="ml-auto text-sm text-slate-600 font-medium px-3 py-1 bg-slate-50 rounded-lg border border-slate-200 shadow-inner">
          {wordCount} words
        </div>
      </div>
    </div>
  );
}

const ColorPopup = ({ colors, onSelect, onClose }) => (
  <div className="absolute top-12 left-0 p-2 bg-background rounded-lg shadow-xl z-50 flex gap-1 flex-wrap w-48 border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
    {colors.map((color) => (
      <button
        key={color}
        type="button"
        className="w-8 h-8 rounded-md cursor-pointer border-2 border-transparent hover:scale-110 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
        style={{ background: color }}
        onMouseDown={(e) => {
          e.preventDefault(); // Prevent focus loss
          // Removed manual onSelect() call here to prevent double firing
        }}
        onClick={() => onSelect(color)} // Only fire here
        aria-label={`Select color ${color}`}
      />
    ))}
  </div>
);