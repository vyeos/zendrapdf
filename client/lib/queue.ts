import { Queue } from "bullmq";
import { redisConnection } from "./redis";

export interface PdfGenerationJobData {
  jobId: string;
  pdfId: string;
  userId: string;
  userPrompt: string;
  fileName?: string;
  isContext?: boolean;
}

export const PDF_GENERATION_QUEUE_NAME = "pdf-generation-queue";

export const pdfGenerationQueue = new Queue<PdfGenerationJobData>(
  PDF_GENERATION_QUEUE_NAME,
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: false, // Keep job record for status polling
      removeOnFail: false,
    },
  },
);

export async function addPdfGenerationJob(data: PdfGenerationJobData) {
  return await pdfGenerationQueue.add("generate-pdf", data, {
    jobId: data.jobId,
  });
}
