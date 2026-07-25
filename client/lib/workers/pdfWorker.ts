import { Worker, Job } from "bullmq";
import { redisConnection } from "../redis";
import { PDF_GENERATION_QUEUE_NAME, PdfGenerationJobData } from "../queue";
import { updatePdfStatus } from "@/db/pdfs";
import { deduceCredits } from "@/db/credits";

export function createPdfWorker() {
  const worker = new Worker<PdfGenerationJobData>(
    PDF_GENERATION_QUEUE_NAME,
    async (job: Job<PdfGenerationJobData>) => {
      const { pdfId, userId, userPrompt, isContext } = job.data;

      try {
        await job.updateProgress(10);
        await updatePdfStatus(pdfId, "processing");

        const PYTHON_URL = process.env.PYTHON_URL || "http://localhost:8000";

        await job.updateProgress(30);

        const res = await fetch(`${PYTHON_URL}/ai/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            secret1: process.env.secret as string,
          },
          body: JSON.stringify({
            userId,
            userPrompt,
            pdfId,
            isContext: isContext || false,
          }),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(`Python AI service returned ${res.status}: ${errText}`);
        }

        await job.updateProgress(80);

        const htmlContent = await res.json();
        if (!htmlContent || typeof htmlContent !== "string") {
          throw new Error("Invalid content returned from AI service");
        }

        await updatePdfStatus(pdfId, "completed", htmlContent);
        await job.updateProgress(100);

        return { success: true, pdfId, htmlContent };
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        console.error(`[PdfWorker] Job ${job.id} failed:`, errorMsg);

        await updatePdfStatus(pdfId, "failed", undefined, errorMsg);

        // Refund 4 credits on failure
        try {
          await deduceCredits(userId, -4);
        } catch (refundErr) {
          console.error(`[PdfWorker] Failed to refund credits for user ${userId}:`, refundErr);
        }

        throw err;
      }
    },
    {
      connection: redisConnection,
      concurrency: 5,
    },
  );

  worker.on("completed", (job) => {
    console.log(`[PdfWorker] Job ${job.id} completed successfully.`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[PdfWorker] Job ${job?.id} failed with error:`, err);
  });

  return worker;
}
