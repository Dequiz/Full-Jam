import { BrowserRouter, Route, Routes } from "react-router-dom";
import CashFlow from "./feature/cashFlow/screen/CashFlow.tsx";
import Dashboard from "./feature/dashboard/screen/Dashboard.tsx";
import Order from "./feature/order/screen/Order.tsx";
import PrivacyPolicy from "./feature/privacyPolicy/PrivacyPolicy.tsx";
import Stock from "./feature/stock/screen/Stock.tsx";
import TermsOfUse from "./feature/termsOfUse/TermsOfUse.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/estoque" element={<Stock />} />
        <Route path="/pedidos" element={<Order />} />
        <Route path="/fluxo-de-caixa" element={<CashFlow />} />
        <Route path="/termos-de-uso" element={<TermsOfUse />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
