import {supabase} from "../lib/supabase/supabaseclient.ts";

export const authService = {
  signIn: async (email: string, password: string) => {
    const {data, error} = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
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