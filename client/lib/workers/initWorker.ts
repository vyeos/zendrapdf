import { createPdfWorker } from "./pdfWorker";

declare global {
  var __pdfWorkerStarted: boolean | undefined;
}

export function initWorkerIfNeeded() {
  if (!globalThis.__pdfWorkerStarted) {
    try {
      createPdfWorker();
      globalThis.__pdfWorkerStarted = true;
      console.log("[Worker] PDF Generation BullMQ Worker initialized.");
    } catch (err) {
      console.error("[Worker] Failed to initialize PDF worker:", err);
    }
  }
}
