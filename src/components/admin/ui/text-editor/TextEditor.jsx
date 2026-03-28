// src/components/admin/ui/text-editor/TextEditor.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import "./textEditor.css"; 
import EditorToolbar from "./EditorToolbar";
import LinkModal from "./modals/LinkModal";
import ImageModal from "./modals/ImageModal";
import TableModal from "./modals/TableModal";

const RichTextEditor = ({ value, onChange, onImageUpload }) => {
  const [modals, setModals] = useState({ link: false, image: false, table: false, find: false });
  const [wordCount, setWordCount] = useState(0);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [activeCommands, setActiveCommands] = useState({});
  
  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null); 

  useEffect(() => {
    if (editorRef.current) {
      const normalizedValue = value || "";
      if (normalizedValue !== editorRef.current.innerHTML) {
        if (document.activeElement !== editorRef.current) {
          editorRef.current.innerHTML = normalizedValue;
          updateWordCount();
        }
      }
    }
  }, [value]);

  const stripHtml = (html) => {
    if (typeof document === 'undefined') return html;
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const updateWordCount = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
    setWordCount(words.length);
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const content = cleanHtmlContent(editorRef.current.innerHTML);
    
    if (onChange) onChange(content);
    updateWordCount();
    checkActiveCommands();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (savedSelectionRef.current) {
      selection.removeAllRanges();
      selection.addRange(savedSelectionRef.current);
    } else {
        editorRef.current?.focus();
    }
  };

  const openModal = (modalName) => {
    saveSelection();
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const checkActiveCommands = useCallback(() => {
    if (typeof document === 'undefined') return;
    
    const getCmd = (cmd) => document.queryCommandState(cmd);
    const block = document.queryCommandValue("formatBlock")?.toLowerCase();
    
    setActiveCommands({
      bold: getCmd("bold"),
      italic: getCmd("italic"),
      underline: getCmd("underline"),
      strikethrough: getCmd("strikeThrough"),
      justifyLeft: getCmd("justifyLeft"),
      justifyCenter: getCmd("justifyCenter"),
      justifyRight: getCmd("justifyRight"),
      justifyFull: getCmd("justifyFull"),
      insertUnorderedList: getCmd("insertUnorderedList"),
      insertOrderedList: getCmd("insertOrderedList"),
      quote: block === "blockquote",
      code: block === "pre",
      subheading: block === "h2",
    });
  }, []);

  const execCommand = (command, value = null) => {
    if (document.activeElement !== editorRef.current) {
        editorRef.current?.focus();
    }

    if (command === "undo" || command === "redo") {
        document.execCommand(command);
    } else if (command === "formatBlock" && value === "h2") {
        const current = document.queryCommandValue("formatBlock")?.toLowerCase();
        document.execCommand("formatBlock", false, current === "h2" ? "p" : "h2");
    } else {
        document.execCommand(command, false, value);
    }
    
    checkActiveCommands();
    handleInput();
  };

  const insertLink = (url, text) => {
    setModals(m => ({ ...m, link: false }));
    restoreSelection();
    
    if (text) {
        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        execCommand("insertHTML", linkHtml);
    } else {
        execCommand("createLink", url);
    }
  };

  const insertImage = (url) => {
    setModals(m => ({ ...m, image: false }));
    restoreSelection();
    execCommand("insertImage", url);
  };

  const insertTable = (rows, cols) => {
    setModals(m => ({ ...m, table: false }));
    restoreSelection();
    
    let html = '<table class="w-full border-collapse my-2"><tbody>';
    for (let i = 0; i < rows; i++) {
      html += '<tr>';
      for (let j = 0; j < cols; j++) {
        html += '<td class="border border-gray-500 p-2 min-w-[50px]">&nbsp;</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br/></p>';
    execCommand("insertHTML", html);
  };

  const handleFindReplace = () => {
    if (!findText || !editorRef.current) return;
    const content = editorRef.current.innerHTML;
    try {
        const regex = new RegExp(findText, "gi");
        editorRef.current.innerHTML = content.replace(regex, replaceText);
        handleInput();
    } catch (e) {
        console.error("Invalid Regex", e);
    }
  };

  const cleanHtmlContent = (html) => {
    // Basic cleaning to prevent layout breakage
    let cleaned = html.replace(/<div[^>]*>/g, "").replace(/<\/div>/g, "");
    if (!cleaned.match(/^\s*<(p|h[1-6]|ul|ol|table|blockquote|pre|img)/i) && cleaned.trim()) {
      cleaned = `<p>${cleaned}</p>`;
    }
    return cleaned;
  };

  return (
    <div className="w-full flex flex-col bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
      <EditorToolbar
        execCommand={execCommand}
        activeCommands={activeCommands}
        wordCount={wordCount}
        onShowLink={() => openModal('link')}
        onShowImage={() => openModal('image')}
        onShowTable={() => openModal('table')}
        onToggleFindReplace={() => setModals(m => ({ ...m, find: !m.find }))}
      />

      {/* Find Replace Bar */}
      {modals.find && (
        <div className="flex gap-2 items-center p-3 bg-background border-b border-slate-200 animate-in slide-in-from-top-2">
          <input className="border border-slate-300 p-1.5 rounded text-sm" placeholder="Find..." value={findText} onChange={e => setFindText(e.target.value)} />
          <input className="border border-slate-300 p-1.5 rounded text-sm" placeholder="Replace..." value={replaceText} onChange={e => setReplaceText(e.target.value)} />
          <button type="button" onClick={handleFindReplace} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">Replace All</button>
          <button type="button" onClick={() => setModals(m => ({ ...m, find: false }))} className="text-slate-500 hover:text-slate-700 ml-auto text-sm">Close</button>
        </div>
      )}

      {/* Editor Canvas */}
      <div className="flex-1 overflow-auto p-4 bg-slate-50">
        <div 
          ref={editorRef}
          contentEditable
          className="bg-background border border-slate-300 rounded-lg p-12 min-h-[400px] shadow-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 editor-styles max-w-none w-full"
          onInput={handleInput}
          onBlur={handleInput}
          onPaste={handlePaste}
          onMouseUp={checkActiveCommands}
          onKeyUp={checkActiveCommands}
          onKeyDown={(e) => {
             if (e.key === 'Tab') {
                e.preventDefault();
                document.execCommand(e.shiftKey ? 'outdent' : 'indent');
             }
          }}
          suppressContentEditableWarning={true}
        />
      </div>

      {/* Modals */}
      <LinkModal 
        isOpen={modals.link} 
        onClose={() => setModals(m => ({ ...m, link: false }))} 
        onInsert={insertLink} 
      />
      <ImageModal 
        isOpen={modals.image} 
        onClose={() => setModals(m => ({ ...m, image: false }))} 
        onInsert={insertImage} 
        onUpload={onImageUpload}
      />
      <TableModal 
        isOpen={modals.table} 
        onClose={() => setModals(m => ({ ...m, table: false }))} 
        onInsert={insertTable} 
      />
    </div>
  );
};

export default RichTextEditor;