import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateAuthorizeRequest } from "@/lib/admin/mcp-oauth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in to connect",
  description: "Team sign-in for connecting Claude or ChatGPT to the psychedelicreadiness.com admin tools.",
  robots: { index: false, follow: false },
};

// The MCP server's sign-in page (OAuth 2.1, see src/lib/admin/mcp-oauth.ts).
// Claude or ChatGPT opens it when a team member adds https://psychedelicreadiness.com/api/mcp
// as a connector. A plain form (no client JS) posting to /api/oauth/authorize,
// which checks the email against MCP_ADMIN_USERS and the shared
// MCP_LOGIN_PASSWORD, then sends the browser back to the app with a one-time
// code. Ported from ramprate-ui's /oauth/authorize page. The site header and
// footer are hidden here (see site-chrome.tsx).

const ERRORS: Record<string, string> = {
  invalid: "That email and password don't match a team member.",
  locked: "Too many attempts. Wait 15 minutes, then try again.",
};

function flat(params: Record<string, string | string[] | undefined>): Record<string, string | undefined> {
  return Object.fromEntries(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex min-h-11 items-center justify-center">
          <span className="font-heading text-2xl font-bold text-foreground">
            Tony<span className="text-brand-gold dark:text-brand-gold-light">G</span>
          </span>
        </Link>
        <Card>{children}</Card>
        <p className="mt-6 text-center font-mono text-xs tracking-wide text-muted-foreground">Team members only.</p>
      </div>
    </main>
  );
}

export default async function AuthorizePage({ searchParams }: PageProps<"/oauth/authorize">) {
  const q = flat(await searchParams);
  const checked = q.invalid ? { error: q.invalid } : await validateAuthorizeRequest(q);

  if ("error" in checked) {
    return (
      <Shell>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Can&apos;t sign in from this link</CardTitle>
          <CardDescription>{checked.error}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Go back to Claude or ChatGPT and connect again from there.</p>
        </CardContent>
      </Shell>
    );
  }

  const error = q.error ? ERRORS[q.error] : undefined;
  const hidden = {
    response_type: "code",
    client_id: checked.params.clientId,
    redirect_uri: checked.params.redirectUri,
    state: checked.params.state,
    code_challenge: checked.params.codeChallenge,
    code_challenge_method: "S256",
    scope: checked.params.scope,
    resource: checked.params.resource,
  };

  return (
    <Shell>
      <CardHeader>
        <p className="font-mono text-xs tracking-[0.2em] text-brand-gold uppercase dark:text-brand-gold-light">Sign in</p>
        <CardTitle className="font-heading text-xl sm:text-2xl">Connect {checked.appName} to psychedelicreadiness.com</CardTitle>
        <CardDescription>Sign in with your team email to let {checked.appName} work on the website for you.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <p role="alert" className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-foreground">
            {error}
          </p>
        )}
        <form method="post" action="/api/oauth/authorize" className="space-y-4">
          {Object.entries(hidden).map(([name, value]) =>
            value ? <input key={name} type="hidden" name={name} value={value} /> : null,
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="username" defaultValue={q.email ?? ""} className="h-11" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required autoComplete="current-password" className="h-11" />
          </div>
          <Button type="submit" className="h-11 w-full">
            Sign in and connect
          </Button>
        </form>
      </CardContent>
    </Shell>
  );
}
