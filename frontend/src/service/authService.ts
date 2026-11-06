import {supabase} from "../lib/supabase/supabaseclient.ts";

export const authService = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        throw new Error(
          "Confirme seu email antes de entrar. Verifique sua caixa de entrada.",
        );
      }
      throw new Error(error.message);
    }

    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },
  
  requestPasswordReset: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw new Error(error.message);
    }
  },

  verifyOtpForResetPassword: async (email: string, code: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email: email,
      token: code,
      type: "recovery",
    });

    if (error) {
      throw new Error("Código inválido ou expirado.");
    }
  },

  updatePasswordWithCode: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(`Falha ao atualizar a senha: ${error.message}`);
    }
  },
};