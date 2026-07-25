export type PdfStatusType = "draft" | "queued" | "processing" | "completed" | "failed" | string;

export interface Pdf {
    id: string;
    fileName: string;
    createdAt: string | null;
    htmlContent?: string | null;
    status?: PdfStatusType;
    errorMessage?: string | null;
}

export interface PdfListProps {
    limit?: number;
    showDelete?: boolean;
    showViewMore?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyActionText?: string;
    emptyActionPath?: string;
    className?: string;
}
