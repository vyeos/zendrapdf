import { auth } from "@/lib/auth";
import { pdfGenerationQueue } from "@/lib/queue";
import { getPdf } from "@/db/pdfs";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: Props) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const job = await pdfGenerationQueue.getJob(jobId);

    // Extract pdfId from jobId if formatted as job_{pdfId}_{timestamp}
    let pdfId = job?.data?.pdfId;
    if (!pdfId && jobId.startsWith("job_")) {
      const parts = jobId.split("_");
      if (parts.length >= 2) {
        pdfId = parts[1];
      }
    }

    let pdfData = null;
    if (pdfId) {
      pdfData = await getPdf(pdfId, session.user.id).catch(() => null);
    }

    if (!job && !pdfData) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const state = job ? await job.getState() : pdfData?.status || "unknown";
    const progress = job ? job.progress : pdfData?.status === "completed" ? 100 : 0;

    return NextResponse.json({
      jobId,
      pdfId: pdfId || pdfData?.id,
      state,
      progress,
      pdfStatus: pdfData?.status || state,
      htmlContent: pdfData?.htmlContent || (job?.returnvalue ? job.returnvalue.htmlContent : null),
      error: job?.failedReason || pdfData?.errorMessage || null,
    });
  } catch (err: unknown) {
    console.error("Job status check error:", err);
    return NextResponse.json(
      { error: "Failed to fetch job status" },
      { status: 500 },
    );
  }
}
