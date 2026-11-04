import {supabase} from "../lib/supabase/supabaseclient.ts";
import type { User } from "../feature/employees/Users.tsx";
import { signUpClient } from "../lib/supabase/signUpClient.ts";

export interface CreateUserInput {
  ID_USUARIO: string;
  NOME: string;
  EMAIL: string;
  SENHA: string;
  ROLE: "PROPRIETARIO" | "FUNCIONARIO";
  ATIVO: boolean;
}

export type UpdateUserInput = Pick<CreateUserInput, "NOME" | "ROLE" | "ATIVO">

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
  },
  getUserById: async (id: string) => {
    const {data, error} = await supabase
      .from("Usuarios")
      .select("*")
      .eq("ID_USUARIO", id)
      .single()

    if (error) {
      throw new Error("Erro ao buscar usuário: " + error.message);
    }

    return data as User
  },
  createUser: async (input: CreateUserInput) => {
    const {data, error} = await signUpClient.auth.signUp({
      email: input.EMAIL.trim(),
      password: input.SENHA
    })

    if (error) {
      throw new Error("Erro ao criar um novo usuário: " + error.message);
    }

    const newUser = data.user;
    if (!newUser || newUser.identities?.length === 0) {
      throw new Error("Já existe um usuário com este email");
    }

    const { error: insertError } = await supabase.from("Usuarios").insert({
      ID_USUARIO: newUser.id,
      NOME: input.NOME.trim(),
      EMAIL: input.EMAIL.trim(),
      ROLE: input.ROLE,
      ATIVO: input.ATIVO,
    })

    if (insertError) {
      throw new Error("Erro ao salvar usuário: " + insertError.message);
    }

    return { id: newUser.id }
  },
  updateUser: async (id: string, input: UpdateUserInput) => {
    const { error } = await supabase
      .from("Usuarios")
      .update({
        NOME: input.NOME.trim(),
        ROLE: input.ROLE,
        ATIVO: input.ATIVO,
      })
      .eq("ID_USUARIO", id)
      .select("ID_USUARIO")
      .single()

    if (error) {
      throw new Error("Erro ao atualizar usuário: " + error.message);
    }
  },
  deleteUser: async (id: string) => {
    const { error } = await supabase
      .from("Usuarios")
      .delete()
      .eq("ID_USUARIO", id)
      .select("ID_USUARIO")
      .single()

    if (error) {
      throw new Error("Erro ao excluir usuário: " + error.message);
    }
  }
}