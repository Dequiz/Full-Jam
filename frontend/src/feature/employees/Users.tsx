import NavBar from "../navbar/NavBar.tsx";
import { useEffect, useState } from "react";
import { userService } from "../../service/userService.ts";
import { toast } from "sonner";
import UserTable from "./components/UserTable.tsx";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export interface User {
  ID_USUARIO: string
  NOME: string
  EMAIL: string
  ROLE: "PROPRIETARIO" | "FUNCIONARIO"
  ATIVO: boolean
}

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);

      try {
        const usersFound = await userService.getAllUsers();
        setUsers(usersFound);
      } catch (error) {
        if (error instanceof Error) {
          toast.error("Erro:" + error.message);
        } else {
          toast.error(
            "Ocorreu um erro desconhecido, entre em contato com o administrador",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    getUsers()
  }, [])

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Excluir usuário?",
      text: "Essa ação não pode ser desfeita.",
      showCancelButton: true,
      confirmButtonColor: "#395CEB",
      cancelButtonColor: "#292929",
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await userService.deleteUser(id)
      setUsers((prev) => prev.filter((user) => user.ID_USUARIO !== id))
      toast.success("Usuário excluido com sucesso!")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro desconhecido, entre em contato com o administrador",
      );
    }
  }

  return (
    <main className={"flex"}>
      <NavBar option="USER" />

      <section className={"flex w-full flex-col gap-8 px-11 py-12"}>
        <header className={"flex items-center justify-between"}>
          <div className={"rounded-2xl p-2.5 shadow-[0_0_4px_#00000040]"}>
            <h1 className={"text-4xl font-bold text-black"}>Usuários</h1>
          </div>

          <button
            className={
              "bg-accent-color hover:bg-button-hover hover:text-hover-text cursor-pointer rounded-xl px-9 py-3.5 text-sm font-semibold text-white hover:transition-colors"
            }
            onClick={() => navigate("/usuarios/adicionar")}
          >
            + Adicionar usuário
          </button>
        </header>

        <UserTable loading={loading} users={users} onDelete={handleDelete}/>
      </section>
    </main>
  );
};

export default Users;
