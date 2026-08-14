"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setError("This reset link is invalid or incomplete.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirmation) return setError("Passwords do not match.");
    setError("");
    setIsLoading(true);
    const { error: resetError } = await authClient.resetPassword({ newPassword: password, token });
    setIsLoading(false);
    if (resetError) return setError(resetError.message || "This reset link has expired. Request a new one.");
    setComplete(true);
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{complete ? "Password updated" : "Choose a new password"}</CardTitle>
        <CardDescription>{complete ? "You can now sign in with your new password." : "Use at least 8 characters."}</CardDescription>
      </CardHeader>
      <CardContent>
        {complete ? (
          <Button asChild className="w-full"><Link href="/login">Continue to login</Link></Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required />
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !token}>
              {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {isLoading ? "Updating…" : "Update password"}
            </Button>
            {!token && <Button asChild variant="outline" className="w-full"><Link href="/forgot-password">Request a new link</Link></Button>}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
