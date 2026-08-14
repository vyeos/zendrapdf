import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto min-h-svh max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-primary hover:underline">← Back to ZendraPdf</Link>
      <article className="mt-8 space-y-6">
        <div><h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1><p className="mt-2 text-sm text-muted-foreground">Last updated August 14, 2026</p></div>
        <section className="space-y-2"><h2 className="text-xl font-semibold">Information we process</h2><p className="leading-7 text-muted-foreground">We process account details, uploaded documents, generated content, and basic service diagnostics needed to provide and improve ZendraPdf.</p></section>
        <section className="space-y-2"><h2 className="text-xl font-semibold">How information is used</h2><p className="leading-7 text-muted-foreground">Information is used to authenticate you, perform requested document operations, maintain your history, prevent abuse, and support the service.</p></section>
        <section className="space-y-2"><h2 className="text-xl font-semibold">Your choices</h2><p className="leading-7 text-muted-foreground">You can delete individual documents from the dashboard and manage or delete your account from account settings.</p></section>
        <section className="space-y-2"><h2 className="text-xl font-semibold">Security</h2><p className="leading-7 text-muted-foreground">We use reasonable safeguards, but no online service can guarantee absolute security. Avoid uploading information you do not have permission to process.</p></section>
      </article>
    </main>
  );
}
