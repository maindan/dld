import { describe, expect, it, vi, beforeEach } from "vitest";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

const { sendPasswordResetEmail } = await import("./send-password-reset");

const VALID_INPUT = { to: "julien@example.com", resetUrl: "https://danlimadev.app/auth/atualizar-senha?token=abc" };

beforeEach(() => {
  sendMock.mockReset();
});

describe("sendPasswordResetEmail", () => {
  it("sends via Resend with the expected recipient, subject, and both HTML/text bodies", async () => {
    sendMock.mockResolvedValue({ data: { id: "email_123" }, error: null });

    await sendPasswordResetEmail(VALID_INPUT);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const call = sendMock.mock.calls[0]?.[0];
    if (!call) throw new Error("expected resend.emails.send to have been called");
    expect(call.to).toBe(VALID_INPUT.to);
    expect(call.subject).toBe("Redefinição de senha - danlimadev");
    expect(call.html).toContain(VALID_INPUT.resetUrl);
    expect(call.text).toContain(VALID_INPUT.resetUrl);
    expect(call.from).toEqual(expect.stringContaining("danlimadev"));
  });

  it("throws with the Resend error details when the send is rejected", async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "Invalid `from` field" },
    });

    await expect(sendPasswordResetEmail(VALID_INPUT)).rejects.toThrow(
      /Resend rejected the password reset email: validation_error - Invalid `from` field/,
    );
  });

  it("rejects an invalid email before calling Resend", async () => {
    await expect(sendPasswordResetEmail({ to: "not-an-email", resetUrl: VALID_INPUT.resetUrl })).rejects.toThrow();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("rejects a non-URL resetUrl before calling Resend", async () => {
    await expect(sendPasswordResetEmail({ to: VALID_INPUT.to, resetUrl: "not-a-url" })).rejects.toThrow();
    expect(sendMock).not.toHaveBeenCalled();
  });
});
