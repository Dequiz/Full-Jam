import EditButton from "../../../core/EditButton.tsx";
import DeleteButton from "../../../core/DeleteButton.tsx";
import type { User } from "../Users.tsx";
import { useNavigate } from "react-router-dom";

interface Config {
  loading: boolean
  users: User[],
  onDelete: (id: string) => void
}

const UserTable = ({ loading, users, onDelete}: Config) => {
  const navigate = useNavigate();

  const th =
    "px-4 py-5 text-left text-base font-semibold font-semibold whitespace-nowrap first:pl-8";
  const td = "px-4 py-5 whitespace-nowrap first:pl-8";

  return (
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
                <td colSpan={6} className="px-8 py-10 text-center">
                  Carregando usuários…
                </td>
              </tr>
            )}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-10 text-center">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            )}

            {users.map((user) => (
              <tr
                key={user.ID_USUARIO}
                className="transition-colors hover:bg-gray-50"
              >
                <td className={td}>{user.ID_USUARIO}</td>
                <td className={td}>{user.NOME}</td>
                <td className={td}>{user.EMAIL}</td>
                <td className={td}>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.ROLE === "PROPRIETARIO"
                        ? "bg-cyan-100 text-cyan-900"
                        : "bg-orange-100 text-orange-900"
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
                <td className={`${td} flex gap-3 pr-8`}>
                  <EditButton
                    objectToEdit={{
                      id: user.ID_USUARIO,
                    }}
                    onEdit={() => navigate(`/usuarios/${user.ID_USUARIO}/editar`)}
                  />
                  <DeleteButton
                    objectToDelete={{
                      id: user.ID_USUARIO,
                    }}
                    onDelete={() => onDelete(user.ID_USUARIO)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;