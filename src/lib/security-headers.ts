/**
 * Security headers for the published site. They are skipped on the editor preview and
 * local development, because the preview runs inside the editor's frame and loads its
 * own helper scripts, which these rules would block.
 */

/** True for hosts that serve the editor preview or local development. */
export function isPreviewHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("id-preview") ||
    host.startsWith("preview--") ||
    host.startsWith("preview-") ||
    host.endsWith("-dev.lovable.app") ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject.com"
  );
}

/** Origin (scheme + host) of the database the browser talks to, or null if unknown. */
export function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function buildContentSecurityPolicy(databaseOrigin: string | null): string {
  const db = databaseOrigin ? [databaseOrigin, databaseOrigin.replace(/^http/, "ws")] : [];
  const dbHttp = databaseOrigin ? [databaseOrigin] : [];
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // The server-rendered page carries small inline scripts that start the app.
    "script-src": ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    "img-src": ["'self'", "data:", "blob:", ...dbHttp, "https://tile.openstreetmap.org"],
    "connect-src": ["'self'", ...db, "https://nominatim.openstreetmap.org"],
    // Google sign-in goes through Lovable's sign-in page.
    "frame-src": ["https://oauth.lovable.app"],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

export function securityHeaders(databaseOrigin: string | null): Record<string, string> {
  return {
    "Content-Security-Policy": buildContentSecurityPolicy(databaseOrigin),
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "DENY",
  };
}

/** Returns the response with the security headers added, unless the host is a preview. */
export function withSecurityHeaders(
  response: Response,
  requestUrl: string,
  databaseOrigin: string | null,
): Response {
  let hostname: string;
  try {
    hostname = new URL(requestUrl).hostname;
  } catch {
    return response;
  }
  if (isPreviewHost(hostname)) return response;
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(securityHeaders(databaseOrigin))) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
