import { db } from "./client";
import { pdf } from "./schema";
import { eq, and, desc, ne, or } from "drizzle-orm";

export type PdfStatus = "draft" | "queued" | "processing" | "completed" | "failed";

export const createPdf = async (
  id: string,
  userId: string,
  fileName: string,
  html_content: string,
  status: PdfStatus = "draft",
) => {
  try {
    const [newPdf] = await db
      .insert(pdf)
      .values({
        id,
        userId,
        fileName,
        htmlContent: html_content,
        status,
      })
      .returning();
    return newPdf;
  } catch (err) {
    throw new Error(`Failed to create pdf : ${err}`);
  }
};

export const updatePdf = async (
  id: string,
  userId: string,
  filename: string,
  htmlContent?: string,
  status?: PdfStatus,
  errorMessage?: string,
) => {
  try {
    const [updatedPdf] = await db
      .update(pdf)
      .set({
        fileName: filename,
        ...(htmlContent !== undefined && { htmlContent }),
        ...(status !== undefined && { status }),
        ...(errorMessage !== undefined && { errorMessage }),
      })
      .where(and(eq(pdf.id, id), eq(pdf.userId, userId)))
      .returning({
        id: pdf.id,
        fileName: pdf.fileName,
        createdAt: pdf.createdAt,
        htmlContent: pdf.htmlContent,
        status: pdf.status,
        errorMessage: pdf.errorMessage,
      });

    return updatedPdf;
  } catch (err) {
    throw new Error(`Failed to update PDF: ${(err as Error).message}`);
  }
};

export const updatePdfStatus = async (
  id: string,
  status: PdfStatus,
  htmlContent?: string,
  errorMessage?: string,
) => {
  try {
    const [updatedPdf] = await db
      .update(pdf)
      .set({
        status,
        ...(htmlContent !== undefined && { htmlContent }),
        ...(errorMessage !== undefined && { errorMessage }),
      })
      .where(eq(pdf.id, id))
      .returning();

    return updatedPdf;
  } catch (err) {
    throw new Error(`Failed to update PDF status: ${(err as Error).message}`);
  }
};

export const getAllPdfs = async (userId: string) => {
  try {
    return await db
      .select({
        id: pdf.id,
        fileName: pdf.fileName,
        createdAt: pdf.createdAt,
        status: pdf.status,
        errorMessage: pdf.errorMessage,
        htmlContent: pdf.htmlContent,
      })
      .from(pdf)
      .where(
        and(
          eq(pdf.userId, userId),
          ne(pdf.status, "draft"),
        ),
      )
      .orderBy(desc(pdf.createdAt));
  } catch (err) {
    throw new Error(`Failed to get pdfs: ${err}`);
  }
};

export const getPdf = async (pdfId: string, userId: string) => {
  try {
    const [currPdf] = await db
      .select()
      .from(pdf)
      .where(and(eq(pdf.id, pdfId), eq(pdf.userId, userId)));
    return currPdf;
  } catch (err) {
    throw new Error(`Failed to get pdf: ${err}`);
  }
};

export const deletePdf = async (pdfId: string, userId: string) => {
  try {
    const [deletedPdf] = await db
      .delete(pdf)
      .where(and(eq(pdf.id, pdfId), eq(pdf.userId, userId)))
      .returning({ id: pdf.id });
    return deletedPdf;
  } catch (err) {
    throw new Error(`Failed to delete pdf: ${err}`);
  }
};
