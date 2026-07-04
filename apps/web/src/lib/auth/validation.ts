import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır."),
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  password: z.string().min(1, "Şifre gereklidir."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token gereklidir."),
  password: z.string().min(8, "Şifre en az 8 karakter olmalıdır."),
});
