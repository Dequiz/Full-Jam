import {supabase} from "../lib/supabase/supabaseclient.ts";

export const authService = {
  signIn: async (email: string, password: string) => {
    const {data, error} = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        throw new Error(
          "Confirme seu email antes de entrar. Verifique sua caixa de entrada.",
        );
      }
      throw new Error(error.message)
    }

    return data
  },

  signOut: async () => {
    const {error} = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }
  },
}