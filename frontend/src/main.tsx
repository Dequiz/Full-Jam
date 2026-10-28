import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./feature/dashboard/screen/Dashboard.tsx";
import Stock from "./feature/stock/screen/Stock.tsx";
import Order from "./feature/order/screen/Order.tsx";
import CashFlow from "./feature/cashFlow/screen/CashFlow.tsx";

const router = createBrowserRouter(
  [
    { path: "/", element: <Dashboard /> },
    { path: "/estoque", element: <Stock /> },
    { path: "/pedidos", element: <Order /> },
    { path: "/fluxo-de-caixa", element: <CashFlow /> },
  ]
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
