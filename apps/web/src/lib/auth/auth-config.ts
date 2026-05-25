/**
 * Configuración de Better Auth con OTP passwordless.
 * Andamiaje: el envío real por SMS/WhatsApp/email se conecta cuando
 * elijamos proveedor (Twilio, Meta WhatsApp Cloud API, Resend, etc.).
 */
import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      sendVerificationOTP({ email, otp, type: _type }) {
        // TODO: conectar provider real (Resend / Twilio / WhatsApp).
        console.info(`[faro/auth] OTP ${otp} → ${email}`);
        return Promise.resolve();
      },
    }),
  ],
});

export type Auth = typeof auth;
