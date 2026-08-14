import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pdfKeys } from "@/lib/queryKeys";

export interface PdfListItem {
  id: string;
  fileName: string;
  createdAt: string | null;
  status?: string;
  errorMessage?: string | null;
  htmlContent?: string | null;
}

export function usePdf(initialLimit: number = 8, enabled: boolean = true) {
  const queryClient = useQueryClient();
  const [showAll, setShowAll] = useState(false);

  const {
    data: pdfs = [],
    isLoading: loading,
    isError,
  } = useQuery<PdfListItem[]>({
    queryKey: pdfKeys.lists(),
    queryFn: async () => {
      const res = await fetch("/api/pdfs");
      if (!res.ok) throw new Error("Failed to fetch PDFs");
      return res.json();
    },
    enabled,
    staleTime: 5 * 1000,
    refetchInterval: (query) => {
      // Auto refetch every 3 seconds if any PDF is currently processing/queued
      const hasActiveJobs = query.state.data?.some(
        (p) => p.status === "processing" || p.status === "queued",
      );
      return hasActiveJobs ? 3000 : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (pdfId: string) => {
      const res = await fetch(`/api/pdfs/${pdfId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete PDF");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdfKeys.lists() });
      toast.success("PDF deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting PDF:", error);
      toast.error("Failed to delete PDF");
    },
  });

  const handleDelete = (pdfId: string) => {
    deleteMutation.mutate(pdfId);
  };

  const handleViewMore = () => setShowAll(true);
  const displayedPdfs =
    showAll || !initialLimit ? pdfs : pdfs.slice(0, initialLimit);

  return {
    pdfs: displayedPdfs,
    totalCount: pdfs.length,
    loading,
    status: isError ? "error" : loading ? "loading" : "idle",
    handleDelete,
    handleViewMore,
    showAll,
    isDeleting: deleteMutation.isPending,
  };
}
