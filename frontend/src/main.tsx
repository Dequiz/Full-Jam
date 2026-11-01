import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./feature/dashboard/screen/Dashboard.tsx";
import Stock from "./feature/stock/screen/Stock.tsx";
import Order from "./feature/order/screen/Order.tsx";
import CashFlow from "./feature/cashFlow/screen/CashFlow.tsx";
import TermsOfUse from "./feature/termsOfUse/TermsOfUse.tsx";
import PrivacyPolicy from "./feature/privacyPolicy/PrivacyPolicy.tsx";
import Login from "./feature/login/Login.tsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path={"/"} element={<Login />} />
        <Route path={"/relatorio"} element={<Dashboard />} />
        <Route path={"/estoque"} element={<Stock />} />
        <Route path={"/pedidos"} element={<Order />} />
        <Route path={"/fluxo-de-caixa"} element={<CashFlow />} />
        <Route path={"/termos-de-uso"} element={<TermsOfUse />} />
        <Route path={"/politica-de-privacidade"} element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
