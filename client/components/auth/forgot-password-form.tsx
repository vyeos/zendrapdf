"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    const { error: requestError } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setIsLoading(false);
    if (requestError) {
      setError(requestError.message || "We could not send the reset email. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{submitted ? "Check your email" : "Reset your password"}</CardTitle>
        <CardDescription>
          {submitted
            ? "If an account exists for that address, a secure reset link is on its way."
            : "Enter the email address associated with your account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="space-y-5 text-center">
            <MailCheck className="mx-auto size-10 text-primary" aria-hidden="true" />
            <Button asChild className="w-full"><Link href="/login">Back to login</Link></Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {isLoading ? "Sending link…" : "Send reset link"}
            </Button>
            <Button asChild variant="ghost" className="w-full"><Link href="/login">Back to login</Link></Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
