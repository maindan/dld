import { describe, expect, it } from "vitest";
import { passwordResetSubject, passwordResetHtml, passwordResetText } from "./password-reset";

const URL = "https://xyzcompany.supabase.co/auth/v1/verify-token-abc123-recovery";

describe("passwordResetSubject", () => {
  it("returns a fixed Portuguese subject", () => {
    expect(passwordResetSubject()).toBe("Redefinição de senha - danlimadev");
  });
});

describe("passwordResetHtml", () => {
  it("embeds the reset URL as the button href and as a fallback link", () => {
    const html = passwordResetHtml(URL);
    expect(html).toContain(`href="${URL}"`);
    expect(html).toContain(URL);
    expect(html).toContain("Redefinir senha");
  });

  it("escapes HTML-significant characters in the URL", () => {
    const dangerous = 'https://example.com/?x="><script>alert(1)</script>&y=a&b=c';
    const html = passwordResetHtml(dangerous);
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&quot;");
  });

  it("is a well-formed HTML document", () => {
    const html = passwordResetHtml(URL);
    expect(html.trim().startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
  });
});

describe("passwordResetText", () => {
  it("includes the raw reset URL for plain-text mail clients", () => {
    const text = passwordResetText(URL);
    expect(text).toContain(URL);
    expect(text).toContain("Redefinição de senha");
    expect(text).not.toContain("<");
  });
});
