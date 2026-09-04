// Backend/src/lib/resend.js
import { Resend } from "resend";
import { ENV } from "./env.js";

export const resendClient = new Resend(ENV.RESEND_API_KEY);

// Single source of truth for the From header.
// EMAIL_FROM should be a bare address; if it already carries a display name
// ("Yappify <a@b.com>") use it as-is rather than nesting the angle brackets.
export const sender = ENV.EMAIL_FROM?.includes("<")
  ? ENV.EMAIL_FROM
  : `${ENV.EMAIL_FROM_NAME || "Yappify"} <${ENV.EMAIL_FROM}>`;
