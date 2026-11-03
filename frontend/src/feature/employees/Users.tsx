import NavBar from "../navbar/NavBar.tsx";
import { useEffect, useState } from "react";
import { userService } from "../../service/userService.ts";
import { toast } from "sonner";

export interface User {
  ID_USUARIO: number
  NOME: string
  EMAIL: string
  ROLE: "PROPRIETARIO" | "FUNCIONARIO"
  ATIVO: boolean
}

const Users = () => {

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const th = "px-4 py-5 text-left text-base font-semibold font-semibold whitespace-nowrap first:pl-8";
  const td = "px-4 py-5 whitespace-nowrap first:pl-8";

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
          >
            + Adicionar usuário
          </button>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-5xl border-collapse">
              <thead className="bg-accent-color text-white">
                <tr>
                  <th scope="col" className={th}>
                    ID
                  </th>
                  <th scope="col" className={th}>
                    Nome do Usuário
                  </th>
                  <th scope="col" className={th}>
                    Email
                  </th>
                  <th scope="col" className={th}>
                    Cargo
                  </th>
                  <th scope="col" className={th}>
                    Status
                  </th>
                  <th scope="col" className={`${th} pr-8`}>
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y-2 divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center">
                      Carregando usuários…
                    </td>
                  </tr>
                )}

                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center">
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                )}

                {users.map((user) => (
                  <tr
                    key={user.ID_USUARIO}
                    className="transition-colors hover:bg-slate-200"
                  >
                    <td className={td}>
                      {user.ID_USUARIO}
                    </td>
                    <td className={td}>{user.NOME}</td>
                    <td className={td}>{user.EMAIL}</td>
                    <td className={td}>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.ROLE === "PROPRIETARIO"
                            ? "bg-blue-300 text-blue-800"
                            : "bg-cyan-300 text-cyan-800"
                        }`}
                      >
                        {user.ROLE}
                      </span>
                    </td>
                    <td className={td}>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.ATIVO
                            ? "bg-active-status-bg text-active-status-text"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {user.ATIVO ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className={`${td} pr-8`}>
                      {/* TODO Botões de Ação */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Users;
