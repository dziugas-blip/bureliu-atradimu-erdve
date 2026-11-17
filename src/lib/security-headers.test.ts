import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, isPreviewHost, withSecurityHeaders } from "./security-headers";

const DB = "https://db.example.lovable.cloud";

describe("security headers", () => {
  it("adds all four headers on the published site", () => {
    const res = withSecurityHeaders(
      new Response("ok", { status: 200 }),
      "https://bureliu-atradimu-erdve.lovable.app/bureliai",
      DB,
    );
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(res.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("Content-Security-Policy")).toContain("default-src 'self'");
    expect(res.status).toBe(200);
  });

  it("allows the database, map tiles, address search and Google Fonts", () => {
    const csp = buildContentSecurityPolicy(DB);
    expect(csp).toMatch(/connect-src [^;]*https:\/\/db\.example\.lovable\.cloud/);
    expect(csp).toMatch(/img-src [^;]*https:\/\/db\.example\.lovable\.cloud/);
    expect(csp).toMatch(/img-src [^;]*https:\/\/tile\.openstreetmap\.org/);
    expect(csp).toMatch(/connect-src [^;]*https:\/\/nominatim\.openstreetmap\.org/);
    expect(csp).toMatch(/style-src [^;]*https:\/\/fonts\.googleapis\.com/);
    expect(csp).toMatch(/font-src [^;]*https:\/\/fonts\.gstatic\.com/);
  });

  it("leaves the editor preview and local development alone", () => {
    for (const url of [
      "https://id-preview--5065a6d0.lovable.app/",
      "https://project--5065a6d0-dev.lovable.app/",
      "http://localhost:8080/",
    ]) {
      const res = withSecurityHeaders(new Response("ok"), url, DB);
      expect(res.headers.get("X-Frame-Options")).toBeNull();
    }
    expect(isPreviewHost("bureliu-atradimu-erdve.lovable.app")).toBe(false);
  });
});
