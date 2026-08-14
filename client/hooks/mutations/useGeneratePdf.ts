import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { userKeys, pdfKeys } from "@/lib/queryKeys";
import { useEditorStore } from "@/store/useEditorStore";

async function pollJobUntilComplete(jobId: string, onProgress?: (progress: number, status: string) => void) {
  const maxAttempts = 120; // 3 minutes timeout (120 * 1.5s)
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const res = await fetch(`/api/jobs/${jobId}`);
    if (!res.ok) continue;

    const data = await res.json();
    if (onProgress && data.progress !== undefined) {
      onProgress(data.progress, data.state || data.pdfStatus);
    }

    if (data.state === "completed" || data.pdfStatus === "completed") {
      return data;
    }

    if (data.state === "failed" || data.pdfStatus === "failed") {
      throw new Error(data.error || "Generation failed during processing");
    }
  }

  throw new Error("Job processing timed out. Please check your dashboard.");
}

export function useGeneratePdf() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { initializeEditor } = useEditorStore();
  const [progress, setProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState("queued");

  const mutation = useMutation({
    mutationFn: async (payload: {
      userPrompt: string;
      fileName: string;
      isContext: boolean;
      pdfId?: string;
    }) => {
      setProgress(5);
      setJobStatus("queued");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 429) throw new Error("DAILY TOKEN LIMIT REACHED");
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || "PDF Generation request failed");
      }

      const queueRes = await res.json();

      // Update user credits immediately from response in query cache
      if (queueRes.creditsLeft !== undefined) {
        queryClient.setQueryData(userKeys.profile(), (oldUser: Record<string, unknown> | undefined) => {
          if (!oldUser) return oldUser;
          return {
            ...oldUser,
            creditsLeft: queueRes.creditsLeft,
          };
        });
      }

      // Poll until job completes
      toast.info("Generation queued! Processing AI workflow in background...", { id: queueRes.jobId });
      const completedJob = await pollJobUntilComplete(
        queueRes.jobId,
        (nextProgress, nextStatus) => {
          setProgress(nextProgress);
          setJobStatus(nextStatus || "processing");
        },
      );
      return {
        ...queueRes,
        htmlContent: completedJob.htmlContent,
      };
    },
    onSuccess: (data, variables) => {
      setProgress(100);
      setJobStatus("completed");
      queryClient.invalidateQueries({ queryKey: pdfKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });

      const hasContext = !!variables.pdfId;

      initializeEditor({
        id: data.pdfId,
        fileName: data.fileName,
        html: data.htmlContent || "",
        isContext: hasContext,
      });

      toast.success(`"${data.fileName}" Generated Successfully!`, { id: data.jobId });
      router.push(`/edit/${data.pdfId}`);
    },
    onError: (error: Error) => {
      setJobStatus("failed");
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      if (error.message !== "DAILY TOKEN LIMIT REACHED") {
        console.error(error);
        toast.error(error.message || "Failed to generate PDF");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });

  return { ...mutation, progress, jobStatus };
}
