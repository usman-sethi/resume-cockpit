import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_placeholder_key_for_safety";
const resend = new Resend(RESEND_API_KEY);

export class EmailService {
  /**
   * Sends a beautiful verification email with the 6-digit OTP.
   */
  static async sendVerificationOtp(email: string, name: string, otp: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: "AI Resume Architect <onboarding@resend.dev>",
        to: [email],
        subject: `${otp} is your AI Resume Architect verification code`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #fafafa;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 560px;
              margin: 40px auto;
              background-color: #ffffff;
              border: 1px solid #e1e8ed;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
            }
            .header {
              padding: 40px 40px 20px 40px;
              text-align: center;
            }
            .logo-badge {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              background-color: #6366f1;
              color: #ffffff;
              font-weight: 800;
              font-size: 20px;
              width: 48px;
              height: 48px;
              border-radius: 12px;
              margin-bottom: 16px;
              box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
            }
            .app-title {
              font-size: 20px;
              font-weight: 700;
              color: #1e293b;
              margin: 0;
              letter-spacing: -0.025em;
            }
            .content {
              padding: 0 40px 40px 40px;
              color: #334155;
              line-height: 1.6;
              font-size: 15px;
            }
            .greeting {
              font-size: 16px;
              font-weight: 600;
              color: #0f172a;
              margin-top: 0;
              margin-bottom: 12px;
            }
            .paragraph {
              margin: 0 0 24px 0;
              color: #475569;
            }
            .otp-container {
              background-color: #f8fafc;
              border: 1px solid #f1f5f9;
              border-radius: 12px;
              padding: 24px;
              text-align: center;
              margin: 28px 0;
            }
            .otp-code {
              font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: 38px;
              font-weight: 800;
              color: #4f46e5;
              letter-spacing: 0.15em;
              margin: 0;
              line-height: 1;
            }
            .expiry-text {
              font-size: 12px;
              color: #94a3b8;
              margin-top: 10px;
              margin-bottom: 0;
              font-weight: 500;
            }
            .divider {
              height: 1px;
              background-color: #f1f5f9;
              margin: 32px 0 24px 0;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
              line-height: 1.5;
            }
            .footer-links {
              margin-top: 12px;
            }
            .footer-links a {
              color: #6366f1;
              text-decoration: none;
              margin: 0 8px;
            }
            .footer-links a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-badge">R</div>
              <h1 class="app-title">AI Resume Architect</h1>
            </div>
            <div class="content">
              <p class="greeting">Hello ${name},</p>
              <p class="paragraph">Please use the verification code below to complete your sign-in / verification process. This code will verify your email and grant secure access to your resume design dashboard.</p>
              
              <div class="otp-container">
                <p class="otp-code">${otp}</p>
                <p class="expiry-text">This code expires in 10 minutes</p>
              </div>
              
              <p class="paragraph" style="margin-bottom: 0;">If you didn't request this verification code, you can safely ignore this email. Your password is secure.</p>
              
              <div class="divider"></div>
              
              <div class="footer">
                <p style="margin: 0;">Sent by AI Resume Architect. Standard security procedures apply.</p>
                <p style="margin: 4px 0 0 0;">© 2026 AI Resume Architect. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
        `
      });

      if (error) {
        console.error(`[Resend OTP Dispatch Error to ${email}]:`, error);
        throw new Error(error.message || JSON.stringify(error));
      }
      return data;
    } catch (err: any) {
      console.error("[EmailService sendVerificationOtp Error]:", err);
      throw err;
    }
  }

  /**
   * Sends a secure password reset email with a verification OTP.
   */
  static async sendPasswordResetOtp(email: string, name: string, otp: string) {
    try {
      const { data, error } = await resend.emails.send({
        from: "AI Resume Architect <onboarding@resend.dev>",
        to: [email],
        subject: `${otp} is your AI Resume Architect password reset code`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #fafafa;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
            }
            .container {
              max-width: 560px;
              margin: 40px auto;
              background-color: #ffffff;
              border: 1px solid #e1e8ed;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
            }
            .header {
              padding: 40px 40px 20px 40px;
              text-align: center;
            }
            .logo-badge {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              background-color: #ef4444;
              color: #ffffff;
              font-weight: 800;
              font-size: 20px;
              width: 48px;
              height: 48px;
              border-radius: 12px;
              margin-bottom: 16px;
              box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
            }
            .app-title {
              font-size: 20px;
              font-weight: 700;
              color: #1e293b;
              margin: 0;
              letter-spacing: -0.025em;
            }
            .content {
              padding: 0 40px 40px 40px;
              color: #334155;
              line-height: 1.6;
              font-size: 15px;
            }
            .greeting {
              font-size: 16px;
              font-weight: 600;
              color: #0f172a;
              margin-top: 0;
              margin-bottom: 12px;
            }
            .paragraph {
              margin: 0 0 24px 0;
              color: #475569;
            }
            .otp-container {
              background-color: #fef2f2;
              border: 1px solid #fee2e2;
              border-radius: 12px;
              padding: 24px;
              text-align: center;
              margin: 28px 0;
            }
            .otp-code {
              font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
              font-size: 38px;
              font-weight: 800;
              color: #dc2626;
              letter-spacing: 0.15em;
              margin: 0;
              line-height: 1;
            }
            .expiry-text {
              font-size: 12px;
              color: #b91c1c;
              margin-top: 10px;
              margin-bottom: 0;
              font-weight: 500;
            }
            .divider {
              height: 1px;
              background-color: #f1f5f9;
              margin: 32px 0 24px 0;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-badge">R</div>
              <h1 class="app-title">AI Resume Architect</h1>
            </div>
            <div class="content">
              <p class="greeting">Hello ${name},</p>
              <p class="paragraph">We received a request to reset your password for your AI Resume Architect account. Please use the following 6-digit code to complete the verification:</p>
              
              <div class="otp-container">
                <p class="otp-code">${otp}</p>
                <p class="expiry-text">This security code will expire in 10 minutes</p>
              </div>
              
              <p class="paragraph" style="margin-bottom: 0;">If you did not request a password reset, you can safely ignore this email; your account security remains intact and no password changes will occur without this verification code.</p>
              
              <div class="divider"></div>
              
              <div class="footer">
                <p style="margin: 0;">Sent securely by AI Resume Architect. If you're having trouble, reply to this email.</p>
                <p style="margin: 4px 0 0 0;">© 2026 AI Resume Architect. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
        `
      });

      if (error) {
        console.error(`[Resend Reset Dispatch Error to ${email}]:`, error);
        throw new Error(error.message || JSON.stringify(error));
      }
      return data;
    } catch (err: any) {
      console.error("[EmailService sendPasswordResetOtp Error]:", err);
      throw err;
    }
  }
}
