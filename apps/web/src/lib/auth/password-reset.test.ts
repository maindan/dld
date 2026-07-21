import { describe, expect, it, vi, beforeEach } from "vitest";

const generateLinkMock = vi.fn();
const sendPasswordResetEmailMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    auth: { admin: { generateLink: generateLinkMock } },
  }),
}));

vi.mock("@danlimadev/email", () => ({
  sendPasswordResetEmail: sendPasswordResetEmailMock,
}));

const { requestPasswordReset } = await import("./password-reset");

const EMAIL = "julien@example.com";
const REDIRECT_TO = "https://danlimadev.app/auth/atualizar-senha";
const ACTION_LINK = "https://xyzcompany.supabase.co/auth/v1/verify?token=abc&type=recovery";

beforeEach(() => {
  generateLinkMock.mockReset();
  sendPasswordResetEmailMock.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("requestPasswordReset", () => {
  it("generates a recovery link and sends it via the email service", async () => {
    generateLinkMock.mockResolvedValue({ data: { properties: { action_link: ACTION_LINK } }, error: null });
    sendPasswordResetEmailMock.mockResolvedValue(undefined);

    await requestPasswordReset(EMAIL, REDIRECT_TO);

    expect(generateLinkMock).toHaveBeenCalledWith({
      type: "recovery",
      email: EMAIL,
      options: { redirectTo: REDIRECT_TO },
    });
    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith({ to: EMAIL, resetUrl: ACTION_LINK });
  });

  it("does not throw and does not send an email when the account doesn't exist", async () => {
    generateLinkMock.mockResolvedValue({ data: {}, error: { message: "User not found" } });

    await expect(requestPasswordReset(EMAIL, REDIRECT_TO)).resolves.toBeUndefined();
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
  });

  it("swallows an error from the email service instead of throwing", async () => {
    generateLinkMock.mockResolvedValue({ data: { properties: { action_link: ACTION_LINK } }, error: null });
    sendPasswordResetEmailMock.mockRejectedValue(new Error("Resend is down"));

    await expect(requestPasswordReset(EMAIL, REDIRECT_TO)).resolves.toBeUndefined();
  });
});
