"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { useEditorStore } from "@/store/useEditorStore";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFPreviewProps {
  loading: boolean;
  html?: string;
  pdfId: string;
  onTextSelect?: () => void;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ loading, onTextSelect }) => {
  const {
    draftHtml,
    updateDraftHtml,
    selectedId,
    selectElement,
    clearSelection,
    aiResponse,
    showAiResponse,
    setAiStatus,
    setAiResponse,
  } = useEditorStore();

  const previewNodeRef = useRef<HTMLElement | null>(null);

  const cleanAiOutput = (raw: string) => {
    return raw
      .replace(/^```html/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();
  };

  const handleAccept = useCallback(() => {
    if (!selectedId || !previewNodeRef.current) return;

    const finalHtml = previewNodeRef.current.outerHTML;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = finalHtml;
    const cleanEl = tempDiv.firstElementChild;
    if (cleanEl) {
      cleanEl.classList.remove("preview-mode", "selected");
      cleanEl.removeAttribute("style");
      cleanEl.id = selectedId;
    }

    const cleanContent = tempDiv.innerHTML;

    const parser = new DOMParser();
    const doc = parser.parseFromString(draftHtml, "text/html");
    const originalEl = doc.getElementById(selectedId);

    if (originalEl) {
      originalEl.outerHTML = cleanContent;
      updateDraftHtml(doc.documentElement.outerHTML);
      toast.success("Changes applied");
    }

    setAiResponse("");
    setAiStatus("prompt");
    clearSelection();

    previewNodeRef.current?.remove();
    previewNodeRef.current = null;
  }, [
    selectedId,
    draftHtml,
    updateDraftHtml,
    setAiResponse,
    setAiStatus,
    clearSelection,
  ]);

  const handleReject = useCallback(() => {
    if (!selectedId) return;

    setAiResponse("");
    setAiStatus("prompt");
    clearSelection();
  }, [selectedId, setAiResponse, setAiStatus, clearSelection]);

  useEffect(() => {
    const previouslySelected = document.querySelectorAll(".selected");
    previouslySelected.forEach((el) => el.classList.remove("selected"));

    if (selectedId) {
      const targetEl = document.getElementById(selectedId);
      if (targetEl) {
        targetEl.classList.add("selected");
      }
    }
  }, [selectedId, draftHtml]);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>("#pdf-root .selectable").forEach((element) => {
      element.tabIndex = 0;
      element.setAttribute("aria-label", `Edit section: ${element.innerText.slice(0, 80)}`);
    });
  }, [draftHtml]);

  useEffect(() => {
    if (!showAiResponse || !selectedId || !aiResponse) {
      if (previewNodeRef.current) {
        previewNodeRef.current.remove();
        previewNodeRef.current = null;
      }
      const original = document.getElementById(selectedId);
      if (original) original.style.display = "";
      return;
    }

    const originalEl = document.getElementById(selectedId);
    if (!originalEl) return;

    if (previewNodeRef.current && document.contains(previewNodeRef.current))
      return;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cleanAiOutput(aiResponse);
    const newEl = tempDiv.firstElementChild as HTMLElement;

    if (!newEl) return;

    newEl.classList.add("preview-mode");
    newEl.id = `${selectedId}-preview`;

    originalEl.insertAdjacentElement("afterend", newEl);
    originalEl.style.display = "none";

    previewNodeRef.current = newEl;

    return () => {
      if (newEl.parentNode) {
        newEl.remove();
      }
      if (originalEl) {
        originalEl.style.display = "";
      }
      previewNodeRef.current = null;
    };
  }, [showAiResponse, selectedId, aiResponse, handleAccept, handleReject]);

  const selectTarget = (target: HTMLElement | null) => {
    if (showAiResponse) {
      toast.info("Please Accept or Reject the AI suggestion first.");
      return;
    }

    if (!target || target.id === "pdf-root" || target.tagName === "BODY")
      return;

    if (!target.id)
      target.id = `gen-${Math.random().toString(36).substr(2, 9)}`;

    if (selectedId === target.id) {
      clearSelection();
    } else {
      selectElement(target.id, target.innerText, target.outerHTML);
      if (onTextSelect) onTextSelect();
    }
  };

  const handlePdfClick = (event: React.MouseEvent) => {
    selectTarget((event.target as HTMLElement).closest(".selectable") as HTMLElement | null);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-muted rounded animate-pulse"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <p id="editor-instructions" className="sr-only">Move through editable sections with Tab and press Enter to select one.</p>
      <div
        id="pdf-root"
        aria-describedby="editor-instructions"
        className="h-full w-full bg-white p-8 overflow-y-auto shadow-sm text-black"
        dangerouslySetInnerHTML={{ __html: draftHtml }}
        onMouseOver={(e) => {
          if (showAiResponse) return;
          const target = (e.target as HTMLElement).closest(".selectable") as HTMLElement | null;
          if (target) target.classList.add("hovered");
        }}
        onMouseOut={(e) => {
          const target = (e.target as HTMLElement).closest(".selectable") as HTMLElement | null;
          if (target) target.classList.remove("hovered");
        }}
        onClick={handlePdfClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            const target = (event.target as HTMLElement).closest(".selectable") as HTMLElement | null;
            if (target) {
              event.preventDefault();
              selectTarget(target);
            }
          }
        }}
        style={{ cursor: showAiResponse ? "default" : "text" }}
      />
      {showAiResponse && (
        <div className="absolute bottom-4 right-4 z-50 flex gap-2 rounded-xl border bg-background p-2 shadow-xl" role="status" aria-live="polite">
          <span className="self-center px-2 text-sm font-medium">Review AI suggestion</span>
          <Button size="sm" onClick={handleAccept}><Check className="size-4" />Accept</Button>
          <Button size="sm" variant="destructive" onClick={handleReject}><X className="size-4" />Reject</Button>
        </div>
      )}
    </div>
  );
};

export default PDFPreview;
