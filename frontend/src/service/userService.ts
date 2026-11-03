import {supabase} from "../lib/supabase/supabaseclient.ts";

export const userService = {
  getAllUsers: async () => {
    const {data, error} = await supabase
      .from("Usuarios")
      .select("*")
      .order("NOME")

    if (error) {
      throw new Error("Erro ao buscar usuários: " + error.message);
    }

    return data
  }
}