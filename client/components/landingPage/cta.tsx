import { CreditCardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CallToAction() {
  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col justify-between gap-y-6 rounded-4xl border bg-card px-4 py-8 shadow-sm md:py-10 dark:bg-card/50">
      <div className="space-y-2">
        <h2 className="text-center font-semibold text-lg tracking-tight md:text-2xl">
          Ready to Create Your First Professional PDF?
        </h2>
        <p className="text-balance text-center text-muted-foreground text-sm md:text-base">
          No credit card{" "}
          <CreditCardIcon className="inline-block size-4" />  required. 20 free credits daily.
        </p>
      </div>
      <div className="flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
        <Button asChild className="w-full shadow sm:w-auto" variant="secondary">
          <Link href='/signup'>
            Start Creating Free
          </Link>
        </Button>
        <Button asChild className="w-full shadow sm:w-auto" variant="outline">
          <Link href='/tools'>
            Explore PDF Tools
          </Link>
        </Button>
        <Button asChild className="w-full shadow sm:w-auto">
          <Link href='/pricing'>
            View Pricing
          </Link>
        </Button>
      </div>
    </div>
  );
}
