import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./feature/dashboard/screen/Dashboard.tsx";
import Stock from "./feature/stock/screen/Stock.tsx";
import Order from "./feature/order/screen/Order.tsx";
import CashFlow from "./feature/cashFlow/screen/CashFlow.tsx";
import TermsOfUse from "./feature/termsOfUse/TermsOfUse.tsx";
import PrivacyPolicy from "./feature/privacyPolicy/PrivacyPolicy.tsx";
import Login from "./feature/login/Login.tsx";

const router = createBrowserRouter(
  [
    { path: "/relatorio", element: <Dashboard /> },
    { path: "/", element: <Login /> },
    { path: "/estoque", element: <Stock /> },
    { path: "/pedidos", element: <Order /> },
    { path: "/fluxo-de-caixa", element: <CashFlow /> },
    { path: "/termos-de-uso", element: <TermsOfUse /> },
    { path: "/politica-de-privacidade", element: <PrivacyPolicy /> },
  ]
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
