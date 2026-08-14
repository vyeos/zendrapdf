"use client";

import { Check, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useEditorStore } from "@/store/useEditorStore";
import { useSavePdf } from "@/hooks/mutations/useSavePdf";

const SaveChanges = () => {
  const { activePdfId, fileName, draftHtml, isDirty, markSaved } = useEditorStore();

  const { mutate: savePdf, isPending } = useSavePdf();

  const handleSave = () => {
    if (!draftHtml || !activePdfId) return;

    if (!fileName.trim()) {
      toast.error("Filename can't be empty");
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(draftHtml, "text/html");
    const selectedEl = doc.querySelector(".selected");
    if (selectedEl) {
      selectedEl.classList.remove("selected");
    }
    const cleanHtml = doc.documentElement.outerHTML;

    savePdf(
      { id: activePdfId, html: cleanHtml, fileName },
      { onSuccess: markSaved },
    );
  };

  return (
    <Button
      variant="secondary"
      size="lg"
      onClick={handleSave}
      disabled={isPending || !isDirty}
      aria-live="polite"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isDirty ? (
        <Save className="w-4 h-4" />
      ) : (
        <Check className="w-4 h-4" />
      )}
      <span>{isPending ? "Saving…" : isDirty ? "Save changes" : "Saved"}</span>
    </Button>
  );
};

export default SaveChanges;
