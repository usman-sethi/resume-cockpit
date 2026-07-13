/**
 * Generates a random 6-digit numeric OTP string.
 */
export function generateNumericOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Checks if the current OTP has expired based on standard 10-minute validity.
 */
export function isOtpExpired(expiryDate: Date | null | undefined): boolean {
  if (!expiryDate) return true;
  return new Date() > new Date(expiryDate);
}

/**
 * Checks if user is within the 60-second rate-limiting period for resending OTPs.
 */
export function isResendRateLimited(lastSentAt: Date | null | undefined): boolean {
  if (!lastSentAt) return false;
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
  return new Date(lastSentAt) > sixtySecondsAgo;
}
