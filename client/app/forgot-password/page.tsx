import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" aria-label="ZendraPdf home" className="flex justify-center"><Logo size="md" showSubtitle showText /></Link>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
