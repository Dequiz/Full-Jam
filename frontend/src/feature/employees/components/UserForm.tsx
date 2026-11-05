import {
  type CreateUserInput,
  userService,
} from "../../../service/userService.ts";
import { Link, useNavigate, useParams } from "react-router-dom";
import { type ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import NavBar from "../../navbar/NavBar.tsx";
import { PulseLoader } from "react-spinners";

const input =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent-color focus:ring-2 focus:ring-accent-color/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-secondary-text";
const label = "mb-2 block text-sm font-medium text-black";

const initialForm: CreateUserInput = {
  ID_USUARIO: "",
  NOME: "",
  EMAIL: "",
  SENHA: "",
  ROLE: "FUNCIONARIO",
  ATIVO: true,
};

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateUserInput>(initialForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const title = isEditing ? "Editar usuário" : "Adicionar usuário";

  useEffect(() => {
    if (!id) return;

    const loadUser = async () => {
      try {
        const user = await userService.getUserById(id);
        setForm({
          ID_USUARIO: user.ID_USUARIO,
          NOME: user.NOME,
          EMAIL: user.EMAIL,
          SENHA: "",
          ROLE: user.ROLE,
          ATIVO: user.ATIVO,
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Ocorreu um erro desconhecido, entre em contato com o administrador",
        );
        navigate("/usuarios");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id, navigate]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "ATIVO" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e: ChangeEvent) => {
    e.preventDefault();

    if (!isEditing && form.SENHA.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setSaving(true);
    try {
      if (isEditing && id) {
        await userService.updateUser(id, form);
        toast.success("Usuário atualizado com sucesso");
      } else {
        await userService.createUser(form);
        toast.success(
          `Usuário criado. Enviamos um email de confirmação para ${form.EMAIL}.`,
        );
      }
      navigate("/usuarios");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro desconhecido, entre em contato com o administrador",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex">
      <NavBar option="USER" />

      <section className="flex w-full flex-col gap-6 px-11 py-12">
        <div>
          <nav className="mb-3 flex items-center gap-2 text-sm">
            <Link to="/usuarios" className="text-accent-color">
              Usuários
            </Link>
            <span className="text-secondary-text">›</span>
            <span className="text-secondary-text font-medium">{title}</span>
          </nav>
          <h1 className="text-4xl font-bold text-black">{title}</h1>
          <p className="text-secondary-text mt-2 text-sm">
            {isEditing
              ? "Altere as informações do usuário e salve as mudanças."
              : "Preencha as informações para cadastrar um novo usuário no sistema."}
          </p>
        </div>

        {loading ? (
          <p className="text-secondary-text text-sm">Carregando usuário…</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-2xl border border-slate-300 bg-white"
          >
            <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="nome" className={label}>
                  Nome do usuário
                </label>
                <input
                  id="nome"
                  name="NOME"
                  type="text"
                  required
                  placeholder="Digite o nome do usuário"
                  value={form.NOME}
                  onChange={handleChange}
                  className={input}
                />
              </div>

              <div>
                <label htmlFor="email" className={label}>
                  Email
                </label>
                <input
                  id="email"
                  name="EMAIL"
                  type="email"
                  required
                  placeholder="Digite o email"
                  value={form.EMAIL}
                  onChange={handleChange}
                  disabled={isEditing}
                  className={input}
                />
              </div>

              {!isEditing && (
                <div>
                  <label htmlFor="senha" className={label}>
                    Senha
                  </label>
                  <input
                    id="senha"
                    name="SENHA"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Mínimo de 6 caracteres"
                    value={form.SENHA}
                    onChange={handleChange}
                    className={input}
                  />
                </div>
              )}

              <div>
                <label htmlFor="role" className={label}>
                  Cargo
                </label>
                <select
                  id="role"
                  name="ROLE"
                  value={form.ROLE}
                  onChange={handleChange}
                  className={`${input} h-12 cursor-pointer`}
                >
                  <option value="FUNCIONARIO">Funcionário</option>
                  <option value="PROPRIETARIO">Proprietário</option>
                </select>
              </div>

              <div>
                <label htmlFor="ativo" className={label}>
                  Status
                </label>
                <select
                  id="ativo"
                  name="ATIVO"
                  value={String(form.ATIVO)}
                  onChange={handleChange}
                  className={`${input} h-12 cursor-pointer`}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
              <button
                type="button"
                onClick={() => navigate("/usuarios")}
                className="text-accent-color cursor-pointer rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-accent-color hover:bg-button-hover hover:text-hover-text cursor-pointer rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60"
              >
                {saving ? (
                  <PulseLoader />
                ) : isEditing ? (
                  "Salvar alterações"
                ) : (
                  "Adicionar usuário"
                )}
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
};

export default UserForm;
