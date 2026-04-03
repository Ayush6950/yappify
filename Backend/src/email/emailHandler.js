import { resendClient } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "./emailTemplate.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  try {
    const { data, error } = await resendClient.emails.send({
      from: "Yappify <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to Yappify ",
      html: createWelcomeEmailTemplate(name, clientURL),
    });

    if (error) {
      console.error("Error sending email:", error);
      return; 
    }

    console.log("Email sent successfully:", data);
 
  } catch (error) {
    console.error("Email failed:", error.message);
  }
};
