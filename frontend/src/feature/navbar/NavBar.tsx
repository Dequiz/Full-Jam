import { Link, useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";
import { authService } from "../../service/authService.ts";
import { toast } from "sonner";
import type { RouteContext } from "../../routes/ProtectedRoute.tsx";

type NavBarOptions = 'DASHBOARD' | 'STOCK' | 'ORDER' | 'CASHFLOW' | 'TERMSOFUSE' | 'PRIVACYPOLICY' | "USER";

const NavBar = ({option}: {option:NavBarOptions}) => {

  const context = useOutletContext<RouteContext | undefined>();
  const isOwner = context?.role === "PROPRIETARIO"

  const showSignOutAlert = () => {
    Swal.fire({
      title: "Deseja sair da conta?",
      showCancelButton: true,
      confirmButtonColor: "#395CEB",
      cancelButtonColor: "#292929",
      confirmButtonText: "Sair",
    }).then(async (result) => {
      if (result.isConfirmed)
        try {
          await authService.signOut();
        } catch (error) {
          toast.error("Erro ao sair, tente novamente");
          console.error(error);
        }
    });
  }

  return (
    <nav className="bg-accent-color flex min-h-screen w-full max-w-72 shrink-0 flex-col justify-between gap-6 px-5 pt-14 pb-8 font-[Poppins]">
      <div className={"flex flex-col gap-6"}>
        <h1 className={"text-nav-text text-4xl font-bold"}>Logo</h1>
        <div className="h-px w-full bg-white/20" />

        <h2 className={"text-nav-text text-2xl font-bold"}>Menu</h2>

        <ol
          className={
            "text-nav-text flex w-full flex-col flex-wrap justify-center gap-10 text-center"
          }
        >
          {isOwner && (
            <Link to="/relatorio">
              <li
                className={`relative flex items-center justify-center gap-2.5 rounded-[15px] text-[17px] transition before:align-middle ${option == "DASHBOARD" ? "bg-active-option-nav text-active-option-text rounded-[20px] py-5 before:content-[url('/navbar-icons/dashboard-selected.svg')]" : "before:content-[url('/navbar-icons/dashboard.svg')]"}`}
              >
                Estatísticas
              </li>
            </Link>
          )}
          <Link to="/estoque">
            <li
              className={`relative flex items-center justify-center gap-2.5 rounded-[15px] text-[17px] transition before:align-middle ${option == "STOCK" ? "bg-active-option-nav text-active-option-text rounded-[20px] py-5 before:content-[url('/navbar-icons/stock-selected.svg')]" : "before:content-[url('/navbar-icons/stock.svg')]"}`}
            >
              Estoque
            </li>
          </Link>
          <Link to="/pedidos">
            <li
              className={`relative flex items-center justify-center gap-2.5 rounded-[15px] text-[17px] transition before:align-middle ${option == "ORDER" ? "bg-active-option-nav text-active-option-text rounded-[20px] py-5 before:content-[url('/navbar-icons/order-selected.svg')]" : "before:content-[url('/navbar-icons/order.svg')]"}`}
            >
              Pedidos
            </li>
          </Link>
          <Link to="/fluxo-de-caixa">
            <li
              className={`relative flex items-center justify-center gap-2.5 rounded-[15px] text-[17px] transition before:align-middle ${option == "CASHFLOW" ? "bg-active-option-nav text-active-option-text rounded-[20px] py-5 before:content-[url('/navbar-icons/cashflow-selected.svg')]" : "before:content-[url('/navbar-icons/cashflow.svg')]"}`}
            >
              Fluxo de Caixa
            </li>
          </Link>
          {isOwner && (
            <Link to="/usuarios">
              <li
                className={`relative flex items-center justify-center gap-2.5 rounded-[15px] text-[17px] transition before:align-middle ${option == "USER" ? "bg-active-option-nav text-active-option-text rounded-[20px] py-5 before:content-[url('/navbar-icons/employee-selected.svg')]" : "before:content-[url('/navbar-icons/employee.svg')]"}`}
              >
                Usuários
              </li>
            </Link>
          )}
        </ol>
      </div>

      <ol
        className={
          "text-nav-text flex flex-col flex-wrap items-start gap-5 text-center"
        }
      >
        <Link to="/termos-de-uso">
          <li
            className={`relative text-base transition before:mr-2 before:align-middle ${option == "TERMSOFUSE" ? "bg-active-option-nav text-active-option-text rounded-3xl before:content-[url('/navbar-icons/docs-selected.svg')]" : "before:content-[url('/navbar-icons/docs.svg')]"}`}
          >
            Termos de Uso
          </li>
        </Link>

        <Link to="/politica-de-privacidade">
          <li
            className={`relative text-base transition before:mr-2 before:align-middle ${option == "PRIVACYPOLICY" ? "bg-active-option-nav text-active-option-text rounded-3xl before:content-[url('/navbar-icons/lock-selected.svg')]" : "before:content-[url('/navbar-icons/lock.svg')]"}`}
          >
            Política de Privacidade
          </li>
        </Link>

        <button onClick={showSignOutAlert} className={"cursor-pointer"}>
          <li
            className={
              "relative text-base transition before:mr-2 before:align-middle before:content-[url('/navbar-icons/leave.svg')]"
            }
          >
            Sair do Sistema
          </li>
        </button>
      </ol>
    </nav>
  );
};

export default NavBar;
