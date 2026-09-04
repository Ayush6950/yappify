import { resendClient, sender } from "../lib/resend.js";
import {
  createWelcomeEmailTemplate,
  createVerifyEmailTemplate,
  createPasswordResetTemplate,
} from "./emailTemplate.js";
import { ENV } from "../lib/env.js";

/**
 * Welcome mail is best-effort: a failure here should never break signup,
 * so it logs instead of throwing (unlike the two below).
 */
export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    const { data, error } = await resendClient.emails.send({
      from: sender,
      to: [email],
      subject: "Welcome to Yappify",
      html: createWelcomeEmailTemplate(name, clientURL),
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return;
    }

    console.log("Welcome email sent successfully:", data?.id);
  } catch (error) {
    console.error("Welcome email failed:", error.message);
  }
};

export const sendVerificationEmail = async (email, name, rawToken) => {
  const verifyURL = `${ENV.CLIENT_URL}/verify-email?token=${rawToken}`;
  const ttlHours = Math.round(ENV.EMAIL_VERIFY_TOKEN_TTL_MIN / 60);

  // While iterating locally you can click the link straight out of the terminal.
  if (ENV.NODE_ENV === "development") {
    console.log(`🔗 Verify: ${verifyURL}`);
  }

  const { error } = await resendClient.emails.send({
    from: sender,
    to: [email],
    subject: "Confirm your Yappify email",
    html: createVerifyEmailTemplate(name, verifyURL, ttlHours),
  });

  // Throw so the caller knows the user never got their link.
  if (error) throw new Error(error.message || "Failed to send verification email");
};

export const sendPasswordResetEmail = async (email, name, rawToken) => {
  const resetURL = `${ENV.CLIENT_URL}/reset-password?token=${rawToken}`;

  if (ENV.NODE_ENV === "development") {
    console.log(`🔗 Reset: ${resetURL}`);
  }

  const { error } = await resendClient.emails.send({
    from: sender,
    to: [email],
    subject: "Reset your Yappify password",
    html: createPasswordResetTemplate(name, resetURL, ENV.PASSWORD_RESET_TOKEN_TTL_MIN),
  });

  if (error) throw new Error(error.message || "Failed to send reset email");
};
