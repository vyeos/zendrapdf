"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import UploadFiles from "@/components/generatePage/UploadFiles";
import AIWorking from "@/components/generatePage/AIWorking";
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
import { Button } from "../ui/button";
import { useGeneratePdf } from "@/hooks/mutations/useGeneratePdf";
import { useEditorStore } from "@/store/useEditorStore";
import useUser from "@/hooks/useUser";
import { TEMPLATE_PROMPTS } from "@/lib/templates";

const CREDIT_COST_PER_GEN = 4;

const Generate = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [input, setInput] = useState("");
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  const { user } = useUser();
  const { activePdfId, fileName, updateFileName, contextFiles, resetEditor } =
    useEditorStore();

  const { mutate: generatePdf, isPending, progress, jobStatus } = useGeneratePdf();

  const templateParam = searchParams.get("template");

  useEffect(() => {
    resetEditor();
  }, [resetEditor]);

  useEffect(() => {
    if (templateParam && TEMPLATE_PROMPTS[templateParam]) {
      const promptText = TEMPLATE_PROMPTS[templateParam].trim();
      setInput(promptText);

      if (!fileName || fileName === "Untitled Document") {
        const readableName = templateParam.replace(/-/g, " ") + " Draft";
        updateFileName(readableName);
      }
    }
  }, [templateParam, updateFileName, fileName]);

  const handleTemplateClick = (key: string) => {
    router.replace(`/generate?template=${key}`);
  };

  const handleSend = () => {
    if (!input.trim()) {
      toast.error("Prompt cannot be empty");
      return;
    }

    const currentCredits = user?.creditsLeft ?? 0;
    if (currentCredits < CREDIT_COST_PER_GEN) {
      setLimitModalOpen(true);
      return;
    }

    generatePdf(
      {
        userPrompt: input,
        fileName: fileName || "Untitled Document",
        isContext: contextFiles.length > 0,
        pdfId: activePdfId ?? undefined,
      },
      {
        onError: (error) => {
          if (
            error.message.includes("LIMIT") ||
            error.message.includes("TOKEN")
          ) {
            setLimitModalOpen(true);
          } else {
            toast.error("Something went wrong with generation");
          }
        },
      },
    );
  };

  if (isPending) {
    return <AIWorking prompt={input} fileName={fileName} status="working" progress={progress} jobStatus={jobStatus} />;
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background lg:flex-row lg:overflow-hidden">
      {/* Left Panel - Main Creation Studio */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="order-2 flex w-full min-h-0 flex-col border-b border-border/60 bg-card/40 lg:order-1 lg:h-full lg:w-3/5 lg:overflow-y-auto lg:border-b-0 lg:border-r"
      >
        <div className="flex-1 p-5 sm:p-7 space-y-6">
          {/* Document Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="document-title" className="text-sm font-semibold text-foreground">
                <span className="mr-2 text-primary">2.</span>Document title
              </label>
              <span className="text-sm text-muted-foreground font-normal">
                Appears on document header
              </span>
            </div>
            <input
              id="document-title"
              type="text"
              value={fileName || ""}
              onChange={(e) => updateFileName(e.target.value)}
              placeholder="e.g., Q3 Technical Architecture Whitepaper"
              className="w-full rounded-xl border border-border bg-background/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all"
            />
          </div>

          {/* Prompt Description */}
          <div className="space-y-2 flex flex-col">
            <div className="flex items-center justify-between">
              <label htmlFor="document-brief" className="text-sm font-semibold text-foreground">
                <span className="mr-2 text-primary">3.</span>Describe your content and layout
              </label>
              {templateParam && (
                <button
                  onClick={() => {
                    setInput("");
                    router.replace("/generate");
                  }}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Clear Template
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                id="document-brief"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe the main sections, topic depth, preferred color scheme, table layouts, or bullet points..."
                className="w-full min-h-[160px] sm:min-h-[210px] resize-none rounded-xl border border-border bg-background/80 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition-all leading-relaxed placeholder:text-muted-foreground/60"
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {input.length} characters
              </div>
            </div>
          </div>

          {/* Action CTA & Credits */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-muted-foreground">
              <span><strong className="text-foreground">Review:</strong> 4 credits · {user?.creditsLeft ?? 0} available</span>
              <Link
                href="/pricing"
                className="font-medium text-primary hover:underline transition-all"
              >
                Upgrade Plan
              </Link>
            </div>

            <Button
              onClick={handleSend}
              disabled={isPending || !input.trim()}
              className="w-full py-6 text-sm sm:text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
              size="lg"
            >
              Generate Document
            </Button>
          </div>

          {/* Context File Attachment Area */}
          <div className="border-t border-border/50 pt-5">
            <h2 className="mb-3 text-sm font-semibold"><span className="mr-2 text-primary">4.</span>Add references <span className="font-normal text-muted-foreground">(optional)</span></h2>
            <UploadFiles />
          </div>
        </div>
      </motion.div>

      {/* Right Panel - Tips & Preset Library */}
      <motion.div
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
        className="order-1 flex w-full min-h-0 flex-col space-y-6 bg-muted/15 p-5 sm:p-7 lg:order-2 lg:h-full lg:w-2/5 lg:overflow-y-auto"
      >
        {/* Preset Templates Library */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-semibold text-sm text-foreground">
              <span className="mr-2 text-primary">1.</span>Choose a starting point
            </h3>
            <span className="text-sm text-muted-foreground">Optional</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
            {Object.keys(TEMPLATE_PROMPTS).map((key) => {
              const isActive = templateParam === key;
              const title = key.replace(/-/g, " ");
              return (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    variant={isActive ? "default" : "outline"}
                    onClick={() => handleTemplateClick(key)}
                    className={`
                      w-full justify-between text-xs sm:text-sm h-auto py-3 px-4 rounded-xl transition-all duration-200 font-medium text-left border-border/80 capitalize
                      ${isActive ? "bg-primary text-primary-foreground" : "hover:border-primary/50 hover:bg-card/80"}
                    `}
                  >
                    <span>{title}</span>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
        <details className="rounded-xl border border-border/60 bg-card p-4">
          <summary className="cursor-pointer text-sm font-semibold">Tips for better results</summary>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
            <li><strong className="text-foreground">Add context:</strong> Attach an existing PDF when the result should use your facts or terminology.</li>
            <li><strong className="text-foreground">Be specific:</strong> Name the audience, sections, tone, colors, tables, or bullet points you need.</li>
          </ul>
        </details>
      </motion.div>

      {/* Limit Modal */}
      <AlertDialog open={limitModalOpen} onOpenChange={setLimitModalOpen}>
        <AlertDialogContent className="bg-card border-border w-[92%] sm:w-[480px] rounded-2xl shadow-xl">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-center text-lg font-semibold text-foreground">
              Insufficient Credits
            </AlertDialogTitle>

            <AlertDialogDescription className="text-center text-sm text-muted-foreground">
              You need at least 4 credits to generate a document. Upgrade your plan to get instant access to credits.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-4">
            <AlertDialogCancel className="border-border w-full sm:w-auto">
              Close
            </AlertDialogCancel>

            <Link href="/pricing" className="w-full sm:w-auto">
              <AlertDialogAction className="w-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition cursor-pointer">
                View Plans & Pricing
              </AlertDialogAction>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Generate;
