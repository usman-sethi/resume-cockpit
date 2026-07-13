import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

// Hook up authentication endpoints
router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/resend-otp", AuthController.resendOtp);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

export default router;
