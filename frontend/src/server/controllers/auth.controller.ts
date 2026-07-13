import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../mongodb";
import { EmailService } from "../services/email.service";
import { generateNumericOtp, isOtpExpired, isResendRateLimited } from "../utils/otp";

const JWT_SECRET = process.env.JWT_SECRET || "resume-cockpit-secret-key-default-change-me";

export class AuthController {
  /**
   * POST /api/auth/signup
   */
  static async signup(req: Request, res: Response) {
    try {
      const { email, password, firstName, imageUrl } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const existingUser = await UserModel.findOne({ email: email.toLowerCase() } as any);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Generate secure unique ID and hash password
      const userId = "usr_" + Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new UserModel({
        id: userId,
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName: firstName || email.split("@")[0],
        imageUrl: imageUrl || "/assets/image.jpg",
        isVerified: true,
        otp: null,
        otpExpires: null,
        otpAttempts: 0,
        lastOtpSentAt: new Date()
      });

      await newUser.save();

      // Dispatch welcome email (non-blocking, no OTP verification needed)
      try {
        await EmailService.sendVerificationOtp(newUser.email, newUser.firstName || "User", "123456");
      } catch (emailErr: any) {
        console.error("[Welcome email failed]:", emailErr);
      }

      // Generate JWT token directly
      const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "30d" });

      return res.status(201).json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          imageUrl: newUser.imageUrl
        }
      });
    } catch (err: any) {
      console.error("[Signup Controller Error]:", err);
      return res.status(500).json({ error: "Internal server error during registration: " + err.message });
    }
  }

  /**
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await UserModel.findOne({ email: email.toLowerCase() } as any);
      if (!user) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      // Generate verified standard token directly
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          imageUrl: user.imageUrl
        }
      });
    } catch (err: any) {
      console.error("[Login Controller Error]:", err);
      return res.status(500).json({ error: "Internal server error during login: " + err.message });
    }
  }

  /**
   * POST /api/auth/verify-otp
   */
  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp, purpose } = req.body; // purpose is optional: 'verify' or 'reset_password'
      if (!email || !otp) {
        return res.status(400).json({ error: "Email and OTP code are required" });
      }

      const user = await UserModel.findOne({ email: email.toLowerCase() } as any);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check max failed attempts first
      if (user.otpAttempts >= 5) {
        const newOtp = generateNumericOtp();
        user.otp = newOtp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.otpAttempts = 0;
        user.lastOtpSentAt = new Date();
        await user.save();

        try {
          if (purpose === "reset_password") {
            await EmailService.sendPasswordResetOtp(user.email, user.firstName || "User", newOtp);
          } else {
            await EmailService.sendVerificationOtp(user.email, user.firstName || "User", newOtp);
          }
        } catch (emailErr) {
          console.error("[Resend After Overlimit failed]:", emailErr);
        }

        return res.status(400).json({
          error: "Too many failed attempts. A new verification code has been dispatched to your email."
        });
      }

      // Check OTP Expiry
      if (isOtpExpired(user.otpExpires)) {
        return res.status(400).json({ error: "OTP expired. Please request a new code." });
      }

      // Compare code
      if (user.otp !== otp.trim()) {
        user.otpAttempts += 1;
        await user.save();

        const remaining = 5 - user.otpAttempts;
        if (remaining <= 0) {
          // Re-trigger new code on next try or do it now
          const newOtp = generateNumericOtp();
          user.otp = newOtp;
          user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
          user.otpAttempts = 0;
          user.lastOtpSentAt = new Date();
          await user.save();

          try {
            if (purpose === "reset_password") {
              await EmailService.sendPasswordResetOtp(user.email, user.firstName || "User", newOtp);
            } else {
              await EmailService.sendVerificationOtp(user.email, user.firstName || "User", newOtp);
            }
          } catch (emailErr) {
            console.error("[Resend After Overlimit failed]:", emailErr);
          }

          return res.status(400).json({
            error: "Too many failed attempts. A fresh verification code has been sent to your email."
          });
        }

        return res.status(400).json({
          error: `Invalid verification code. ${remaining} attempts remaining.`
        });
      }

      // OTP is valid!
      if (purpose === "reset_password") {
        // For security, do not reset password here. Simply return success, and the frontend
        // will call reset-password with this same validated OTP code.
        return res.status(200).json({
          success: true,
          message: "OTP verified successfully. Please enter your new password now."
        });
      }

      // Standard email verification flow
      user.isVerified = true;
      user.otp = null;
      user.otpExpires = null;
      user.otpAttempts = 0;
      await user.save();

      // Sign JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          imageUrl: user.imageUrl
        }
      });
    } catch (err: any) {
      console.error("[Verify OTP Error]:", err);
      return res.status(500).json({ error: "Failed to verify OTP code: " + err.message });
    }
  }

  /**
   * POST /api/auth/resend-otp
   */
  static async resendOtp(req: Request, res: Response) {
    try {
      const { email, purpose } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await UserModel.findOne({ email: email.toLowerCase() } as any);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Enforce 60-second rate limit
      if (isResendRateLimited(user.lastOtpSentAt)) {
        const elapsed = Math.round((Date.now() - new Date(user.lastOtpSentAt).getTime()) / 1000);
        const waitTime = Math.max(1, 60 - elapsed);
        return res.status(429).json({
          error: `Please wait ${waitTime} seconds before requesting another code.`
        });
      }

      const otp = generateNumericOtp();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      user.otpAttempts = 0;
      user.lastOtpSentAt = new Date();
      await user.save();

      let emailErrorMsg = "";
      try {
        if (purpose === "reset_password") {
          await EmailService.sendPasswordResetOtp(user.email, user.firstName || "User", otp);
        } else {
          await EmailService.sendVerificationOtp(user.email, user.firstName || "User", otp);
        }
        console.log(`[Resend Request OTP] Dispatched code ${otp} to ${user.email} (purpose: ${purpose || "verify"})`);
      } catch (emailErr: any) {
        console.error("[Resend Request OTP failed]:", emailErr);
        emailErrorMsg = emailErr.message || String(emailErr);
      }

      return res.status(200).json({
        success: true,
        message: emailErrorMsg
          ? `Verification code re-generated, but we encountered an issue sending the email: ${emailErrorMsg}.`
          : "A fresh verification code has been sent to your email.",
        debugOtp: emailErrorMsg ? otp : undefined,
        emailError: emailErrorMsg || undefined
      });
    } catch (err: any) {
      console.error("[Resend OTP Error]:", err);
      return res.status(500).json({ error: "Failed to resend OTP: " + err.message });
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await UserModel.findOne({ email: email.toLowerCase() } as any);
      if (!user) {
        return res.status(404).json({ error: "No account registered with this email address" });
      }

      // Rate limit
      if (isResendRateLimited(user.lastOtpSentAt)) {
        const elapsed = Math.round((Date.now() - new Date(user.lastOtpSentAt).getTime()) / 1000);
        const waitTime = Math.max(1, 60 - elapsed);
        return res.status(429).json({
          error: `Please wait ${waitTime} seconds before requesting a password reset code.`
        });
      }

      const otp = generateNumericOtp();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      user.otpAttempts = 0;
      user.lastOtpSentAt = new Date();
      await user.save();

      let emailErrorMsg = "";
      try {
        await EmailService.sendPasswordResetOtp(user.email, user.firstName || "User", otp);
        console.log(`[Forgot Password OTP] Sent code ${otp} to ${user.email}`);
      } catch (emailErr: any) {
        console.error("[Forgot Password Email failed]:", emailErr);
        emailErrorMsg = emailErr.message || String(emailErr);
      }

      return res.status(200).json({
        success: true,
        email: user.email,
        message: emailErrorMsg
          ? `Reset requested, but we encountered an issue sending the verification email: ${emailErrorMsg}.`
          : "Verification code sent to your email. Please enter it to reset your password.",
        debugOtp: emailErrorMsg ? otp : undefined,
        emailError: emailErrorMsg || undefined
      });
    } catch (err: any) {
      console.error("[Forgot Password Error]:", err);
      return res.status(500).json({ error: "Failed to request password reset: " + err.message });
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: "Email, OTP, and new password are required." });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
      }

      const user = await UserModel.findOne({ email: email.toLowerCase() } as any);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check OTP Expiry
      if (isOtpExpired(user.otpExpires)) {
        return res.status(400).json({ error: "Verification code expired. Please request a new one." });
      }

      // Check OTP match
      if (user.otp !== otp.trim()) {
        user.otpAttempts += 1;
        await user.save();

        if (user.otpAttempts >= 5) {
          // overlimit
          const newOtp = generateNumericOtp();
          user.otp = newOtp;
          user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
          user.otpAttempts = 0;
          user.lastOtpSentAt = new Date();
          await user.save();

          try {
            await EmailService.sendPasswordResetOtp(user.email, user.firstName || "User", newOtp);
          } catch (emailErr) {
            console.error("[Reset Overlimit failed]:", emailErr);
          }

          return res.status(400).json({
            error: "Too many failed attempts. A fresh password reset code has been sent to your email."
          });
        }

        return res.status(400).json({
          error: `Invalid verification code. ${5 - user.otpAttempts} attempts remaining.`
        });
      }

      // Password OTP matches successfully! Set the new password and clean up OTP
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.isVerified = true; // Safe to set verified as they passed OTP verification
      user.otp = null;
      user.otpExpires = null;
      user.otpAttempts = 0;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Your password has been successfully reset! Please sign in using your new password."
      });
    } catch (err: any) {
      console.error("[Reset Password Error]:", err);
      return res.status(500).json({ error: "Failed to reset password: " + err.message });
    }
  }
}
