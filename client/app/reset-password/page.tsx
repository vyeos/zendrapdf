import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" aria-label="ZendraPdf home" className="flex justify-center"><Logo size="md" showSubtitle showText /></Link>
        <Suspense><ResetPasswordForm /></Suspense>
      </div>
    </main>
  );
}
