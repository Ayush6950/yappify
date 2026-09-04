export function createWelcomeEmailTemplate(name, clientURL) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to yappify</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background: linear-gradient(to right, #40c8d1, #5B86E5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
      <img src="https://img.freepik.com/free-vector/hand-drawn-message-element-vector-cute-sticker_53876-118344.jpg?t=st=1741295028~exp=1741298628~hmac=0d076f885d7095f0b5bc8d34136cd6d64749455f8cb5f29a924281bafc11b96c&w=1480" alt="yappify Logo" style="width: 80px; height: 80px; margin-bottom: 20px; border-radius: 50%; background-color: white; padding: 10px;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">Welcome to yappify!</h1>
    </div>
    <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <p style="font-size: 18px; color: #5B86E5;"><strong>Hello ${name},</strong></p>
      <p>We're excited to have you join our messaging platform! yappify connects you with friends, family, and colleagues in real-time, no matter where they are.</p>
      
      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #36D1DC;">
        <p style="font-size: 16px; margin: 0 0 15px 0;"><strong>Get started in just a few steps:</strong></p>
        <ul style="padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 10px;">Set up your profile picture</li>
          <li style="margin-bottom: 10px;">Find and add your contacts</li>
          <li style="margin-bottom: 10px;">Start a conversation</li>
          <li style="margin-bottom: 0;">Share photos, videos, and more</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href=${clientURL} style="background: linear-gradient(to right, #36D1DC, #5B86E5); color: white; text-decoration: none; padding: 12px 30px; border-radius: 50px; font-weight: 500; display: inline-block;">Open Messenger</a>
      </div>
      
      <p style="margin-bottom: 5px;">If you need any help or have questions, we're always here to assist you.</p>
      <p style="margin-top: 0;">Happy messaging!</p>
      
      <p style="margin-top: 25px; margin-bottom: 0;">Best regards,<br>The Messenger Team</p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p>© 2025 Messenger. All rights reserved.</p>
      <p>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Terms of Service</a>
        <a href="#" style="color: #5B86E5; text-decoration: none; margin: 0 10px;">Contact Us</a>
      </p>
    </div>
  </body>
  </html>
  `;
}

const shell = (heading, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family:'Segoe UI',Tahoma,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px;background:#f5f5f5;">
  <div style="background:linear-gradient(to right,#36D1DC,#5B86E5);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
    <h1 style="color:#fff;margin:0;font-size:26px;font-weight:500;">${heading}</h1>
  </div>
  <div style="background:#fff;padding:35px;border-radius:0 0 12px 12px;box-shadow:0 4px 15px rgba(0,0,0,.05);">
    ${bodyHtml}
    <p style="margin-top:32px;font-size:12px;color:#999;">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`;

const button = (url, label) => `
  <div style="text-align:center;margin:30px 0;">
    <a href="${url}" style="background:linear-gradient(to right,#36D1DC,#5B86E5);color:#fff;text-decoration:none;padding:14px 34px;border-radius:50px;font-weight:500;display:inline-block;">${label}</a>
  </div>
  <p style="font-size:13px;color:#777;word-break:break-all;">
    Or paste this link into your browser:<br><a href="${url}" style="color:#5B86E5;">${url}</a>
  </p>`;

export function createVerifyEmailTemplate(name, verifyURL, ttlHours) {
  return shell(
    "Confirm your email",
    `<p style="font-size:18px;color:#5B86E5;"><strong>Hello ${name},</strong></p>
     <p>Confirm your email address to unlock messaging on Yappify.</p>
     ${button(verifyURL, "Verify my email")}
     <p style="font-size:14px;color:#777;">This link expires in ${ttlHours} hour(s).</p>`
  );
}

export function createPasswordResetTemplate(name, resetURL, ttlMinutes) {
  return shell(
    "Reset your password",
    `<p style="font-size:18px;color:#5B86E5;"><strong>Hello ${name},</strong></p>
     <p>We received a request to reset your Yappify password.</p>
     ${button(resetURL, "Choose a new password")}
     <p style="font-size:14px;color:#777;">
       This link expires in ${ttlMinutes} minutes and can only be used once.
     </p>`
  );
}
