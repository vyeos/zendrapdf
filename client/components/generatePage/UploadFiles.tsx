"use client";
import { useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, Upload } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useEditorStore } from "@/store/useEditorStore";

export default function UploadFiles() {
  const {
    activePdfId,
    fileName,
    contextFiles,
    setContextFiles,
    initializeEditor,
  } = useEditorStore();

  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [limitFilesModalOpen, setLimitFilesModalOpen] = useState(false);

  const uploadFile = async (newFile: File) => {
    if (!newFile || loading) return;

    if (contextFiles.length >= 5) {
      setLimitFilesModalOpen(true);
      return;
    }

    if (newFile.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (newFile.size > maxSize) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    setLoading(true);

    try {
      let targetId = activePdfId;

      if (!targetId) {
        const createRes = await fetch("/api/pdfs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfName: fileName || "Untitled" }),
        });

        if (!createRes.ok) throw new Error("Failed to create PDF session");

        const newPdf = await createRes.json();
        targetId = newPdf.id;

        initializeEditor({
          id: newPdf.id,
          fileName: newPdf.fileName,
          html: "",
          isContext: true,
        });
      }

      if (!targetId) throw new Error("PDF ID is missing");

      const formData = new FormData();
      formData.append("file", newFile);

      const res = await fetch(`/api/pdfs/${targetId}/context`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setContextFiles([...contextFiles, newFile.name]);
      toast.success(`${newFile.name} attached as context!`);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = async (fileToDelete: string) => {
    if (!activePdfId) return;

    try {
      setIsRemoving(true);
      const res = await fetch(`/api/pdfs/${activePdfId}/context`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: fileToDelete }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete");
      }

      setContextFiles(contextFiles.filter((f) => f !== fileToDelete));
      toast.success(`${fileToDelete} removed`);
    } catch (err) {
      console.error("Remove error:", err);
      toast.error("Failed to remove file");
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-semibold text-foreground">
          Reference Documents (RAG Context)
        </label>
        <span className="text-[11px] text-muted-foreground font-medium bg-muted/40 px-2 py-0.5 rounded-full">
          {contextFiles.length} / 5 uploaded
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Upload Zone */}
        <div className={`flex-1 ${contextFiles.length > 0 ? "sm:w-1/2" : "w-full"}`}>
          <div
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200
                        min-h-[110px] flex flex-col items-center justify-center relative overflow-hidden group
                        ${dragActive ? "border-primary bg-primary/10 scale-[1.01]" : "border-border/80 hover:border-primary/60 hover:bg-primary/5 bg-background/50"}
                        ${loading ? "opacity-60 cursor-wait" : ""}
            `}
            onDragOver={(e) => {
              if (!loading) {
                e.preventDefault();
                setDragActive(true);
              }
            }}
            onDragLeave={() => {
              if (!loading) setDragActive(false);
            }}
            onDrop={handleDrop}
            onClick={() => {
              if (!loading) document.getElementById("fileInput")?.click();
            }}
            role="button"
            tabIndex={loading ? -1 : 0}
            aria-label="Upload a PDF reference document"
            onKeyDown={(event) => {
              if (!loading && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                document.getElementById("fileInput")?.click();
              }
            }}
          >
            <Upload
              className={`mx-auto mb-2 text-primary transition-transform duration-300 ${
                loading ? "animate-bounce" : "group-hover:scale-110"
              }`}
              size={24}
            />
            <p className="text-xs font-semibold text-primary">
              {loading ? "Indexing Vector Embeddings..." : "Drop PDF here or click to browse"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Supports PDF up to 5MB
            </p>
            <input
              disabled={loading}
              id="fileInput"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && uploadFile(e.target.files[0])
              }
            />
          </div>
        </div>

        {/* Files List */}
        {contextFiles.length > 0 && (
          <div className="sm:w-1/2 flex flex-col justify-start">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">
              Attached Knowledge Base
            </div>
            <div className="max-h-[130px] overflow-y-auto pr-1 space-y-1.5">
              <AnimatePresence>
                {contextFiles.map((fName, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/60 text-xs shadow-2xs gap-2"
                  >
                    <span className="truncate text-foreground font-medium">
                      {fName}
                    </span>
                    <button
                      onClick={() => removeFile(fName)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-1.5 py-0.5 rounded-md transition text-[11px]"
                      disabled={isRemoving}
                    >
                      {isRemoving ? (
                        <LoaderCircle size={12} className="animate-spin" />
                      ) : (
                        "Remove"
                      )}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Limit Modal */}
      <AlertDialog
        open={limitFilesModalOpen}
        onOpenChange={setLimitFilesModalOpen}
      >
        <AlertDialogContent className="w-[92%] sm:w-[480px] rounded-2xl">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-center text-base font-semibold">
              Context File Limit Reached
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-xs text-muted-foreground">
              You can upload up to 5 reference files per document. Upgrade your plan for higher file limits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="text-xs">Close</AlertDialogCancel>
            <Link href="/pricing" className="w-full sm:w-auto">
              <AlertDialogAction className="w-full text-xs">
                View Pricing
              </AlertDialogAction>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
