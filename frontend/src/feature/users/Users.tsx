import NavBar from "../navbar/NavBar.tsx";
import { useEffect, useState } from "react";
import { userService } from "../../service/userService.ts";
import { toast } from "sonner";
import UserTable from "./components/UserTable.tsx";
import { useNavigate } from "react-router-dom";
import DeleteModal, {
  DeleteItemCard,
  StatusBadge,
} from "../../core/DeleteModal.tsx";

export interface User {
  ID_USUARIO: string;
  NOME: string;
  EMAIL: string;
  ROLE: "PROPRIETARIO" | "FUNCIONARIO";
  ATIVO: boolean;
}

const roleLabel: Record<User["ROLE"], string> = {
  PROPRIETARIO: "Proprietário",
  FUNCIONARIO: "Funcionário",
};

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

    getUsers();
  }, []);

  const handleDelete = (id: string) => {
    const user = users.find((item) => item.ID_USUARIO === id);
    if (user) setUserToDelete(user);
  };

  const cancelDelete = () => {
    if (isDeleting) return;
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.ID_USUARIO);
      setUsers((prev) =>
        prev.filter((user) => user.ID_USUARIO !== userToDelete.ID_USUARIO),
      );
      toast.success("Usuário excluído com sucesso!");
      setUserToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro desconhecido, entre em contato com o administrador",
      );
    } finally {
      setIsDeleting(false);
    }
  };

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

        <UserTable loading={loading} users={users} onDelete={handleDelete} />
      </section>

      {userToDelete && (
        <DeleteModal
          title="Excluir usuário?"
          description="Você está prestes a excluir o usuário abaixo. Confira a identificação antes de continuar."
          warning="Esta ação não pode ser desfeita. Apenas o usuário selecionado será removido da tabela."
          confirmLabel="Excluir usuário"
          isSubmitting={isDeleting}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        >
          <DeleteItemCard
            title={userToDelete.NOME}
            badge={<StatusBadge active={userToDelete.ATIVO} />}
            subtitle={userToDelete.EMAIL}
            details={roleLabel[userToDelete.ROLE]}
          />
        </DeleteModal>
      )}
    </main>
  );
};

export default Users;
