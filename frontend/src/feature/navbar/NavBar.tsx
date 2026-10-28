import { Link } from "react-router-dom";

type NavBarOptions = 'DASHBOARD' | 'STOCK' | 'ORDER' | 'CASHFLOW';

const NavBar = ({option}: {option:NavBarOptions}) => {

  return (
    <div
      className={
        "bg-accent-color flex min-h-screen w-full max-w-72 flex-col gap-6 pt-16 pr-5 pb-8 pl-5"
      }
    >
      <h1 className={"text-nav-text text-4xl font-bold"}>Logo</h1>

      <h2 className={"text-nav-text text-2xl font-bold"}>Menu</h2>

      <ol
        className={
          "text-nav-text flex flex-col flex-wrap justify-center gap-5 text-center"
        }
      >
        <Link to="/">
          <li
            className={`relative pt-5 pb-5 text-base transition before:mr-2 before:align-middle ${option == "DASHBOARD" ? "bg-active-option-nav text-active-option-text rounded-3xl before:content-[url('/navbar-icons/dashboard-selected.svg')]" : "before:content-[url('/navbar-icons/dashboard.svg')]"}`}
          >
            Estatísticas
          </li>
        </Link>
        <Link to="/estoque">
          <li
            className={`relative pt-5 pb-5 text-base transition before:mr-2 before:align-middle ${option == "STOCK" ? "bg-active-option-nav text-active-option-text rounded-3xl before:content-[url('/navbar-icons/stock-selected.svg')]" : "before:content-[url('/navbar-icons/stock.svg')]"}`}
          >
            Estoque
          </li>
        </Link>
        <Link to="/pedidos">
          <li
            className={`relative pt-5 pb-5 text-base transition before:mr-2 before:align-middle ${option == "ORDER" ? "bg-active-option-nav text-active-option-text rounded-3xl before:content-[url('/navbar-icons/order-selected.svg')]" : "before:content-[url('/navbar-icons/order.svg')]"}`}
          >
            Pedidos
          </li>
        </Link>
        <Link to="/fluxo-de-caixa">
          <li
            className={`relative pt-5 pb-5 text-base transition before:mr-2 before:align-middle ${option == "CASHFLOW" ? "bg-active-option-nav text-active-option-text rounded-3xl before:content-[url('/navbar-icons/cashflow-selected.svg')]" : "before:content-[url('/navbar-icons/cashflow.svg')]"}`}
          >
            Fluxo de Caixa
          </li>
        </Link>
      </ol>
    </div>
  );
};

export default NavBar;
