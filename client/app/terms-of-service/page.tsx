import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-svh max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-primary hover:underline">← Back to ZendraPdf</Link>
      <article className="mt-8 space-y-6">
        <div><h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1><p className="mt-2 text-sm text-muted-foreground">Last updated August 14, 2026</p></div>
        <section className="space-y-2"><h2 className="text-xl font-semibold">Using ZendraPdf</h2><p className="leading-7 text-muted-foreground">You may use ZendraPdf to create, edit, and convert documents that you have the right to process. You are responsible for the content you upload and generate.</p></section>
        <section className="space-y-2"><h2 className="text-xl font-semibold">Accounts and credits</h2><p className="leading-7 text-muted-foreground">Keep your account secure. Credits are consumed by eligible AI operations as described in the product before you confirm an action.</p></section>
        <section className="space-y-2"><h2 className="text-xl font-semibold">Acceptable use</h2><p className="leading-7 text-muted-foreground">Do not use the service to violate laws, infringe rights, distribute malware, or attempt unauthorized access to the service or other accounts.</p></section>
        <section className="space-y-2"><h2 className="text-xl font-semibold">Availability</h2><p className="leading-7 text-muted-foreground">The service is provided as available and may change as features evolve. Review important documents before relying on or distributing them.</p></section>
      </article>
    </main>
  );
}
