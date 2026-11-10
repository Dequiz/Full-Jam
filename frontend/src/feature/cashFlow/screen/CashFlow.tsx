import { useMemo, useState, type FormEvent } from "react";
import NavBar from "../../navbar/NavBar.tsx";
import { useOutletContext } from "react-router-dom";
import type { RouteContext } from "../../../routes/ProtectedRoute.tsx";

type TransactionType = "Entrada" | "Saída";
type Transaction = {
  id: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
};
type Draft = Omit<Transaction, "id">;
type Period = "all" | "month" | "year";

const STORAGE_KEY = "kaysen-cashflow-transactions";
const today = () => new Date().toISOString().slice(0, 10);
const currentMonth = () => new Date().toISOString().slice(0, 7);
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dateLabel = (value: string) => new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR");
const categories = {
  Entrada: ["Vendas", "Serviços", "Investimentos", "Outros"],
  Saída: ["Compras", "Aluguel", "Salários", "Contas", "Impostos", "Marketing", "Outros"],
};
const emptyDraft: Draft = { description: "", category: "Vendas", type: "Entrada", amount: 0, date: today() };

function readTransactions(): Transaction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed as Transaction[] : [];
  } catch {
    return [];
  }
}

const primaryButton = "inline-flex h-11 items-center justify-center rounded-[10px] bg-accent-color px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton = "inline-flex h-10 items-center justify-center rounded-[9px] border border-input-stroke bg-white px-4 text-sm font-semibold text-accent-color transition hover:bg-slate-50";
const fieldClass = "mt-1 h-11 w-full rounded-[9px] border border-input-stroke bg-white px-3 text-sm text-[#1f2937] outline-none transition focus:border-accent-color focus:ring-2 focus:ring-blue-100";

export default function CashFlow() {
  const [transactions, setTransactions] = useState<Transaction[]>(readTransactions);
  const [period, setPeriod] = useState<Period>("month");
  const [chartMonths, setChartMonths] = useState<6 | 12 | 18 | 24>(6);
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [formError, setFormError] = useState("");

  const context = useOutletContext<RouteContext | undefined>();
  const isOwner = context?.role === "PROPRIETARIO"

  const persist = (next: Transaction[]) => {
    setTransactions(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Storage may be unavailable. */ }
  };

  const filtered = useMemo(() => transactions
    .filter((item) => {
      const date = new Date(`${item.date}T12:00:00`);
      const now = new Date();
      const inPeriod = period === "all"
        || (period === "month" && item.date.slice(0, 7) === currentMonth())
        || (period === "year" && date.getFullYear() === now.getFullYear());
      const inType = typeFilter === "Todos" || item.type === typeFilter;
      const inSearch = `${item.description} ${item.category}`.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"));
      return inPeriod && inType && inSearch;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
  [transactions, period, typeFilter, search]);

  const totals = useMemo(() => filtered.reduce((acc, item) => {
    if (item.type === "Entrada") acc.income += item.amount;
    else acc.expenses += item.amount;
    return acc;
  }, { income: 0, expenses: 0 }), [filtered]);
  const balance = totals.income - totals.expenses;

  const openNew = () => {
    setEditingId(null);
    setDraft({ ...emptyDraft, date: today() });
    setFormError("");
    setFormOpen(true);
  };
  const openEdit = (item: Transaction) => {
    setEditingId(item.id);
    setDraft({ description: item.description, category: item.category, type: item.type, amount: item.amount, date: item.date });
    setFormError("");
    setFormOpen(true);
  };
  const closeForm = () => { setFormOpen(false); setEditingId(null); setFormError(""); };

  const saveTransaction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.description.trim()) { setFormError("Informe uma descrição para a movimentação."); return; }
    if (!Number.isFinite(draft.amount) || draft.amount <= 0) { setFormError("Informe um valor maior que zero."); return; }
    if (!draft.date) { setFormError("Informe a data da movimentação."); return; }
    const normalized = { ...draft, description: draft.description.trim(), amount: Number(draft.amount) };
    if (editingId) {
      persist(transactions.map((item) => item.id === editingId ? { ...normalized, id: editingId } : item));
    } else {
      persist([{ ...normalized, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }, ...transactions]);
    }
    closeForm();
  };

  const removeTransaction = () => {
    if (!deletingId) return;
    persist(transactions.filter((item) => item.id !== deletingId));
    setDeletingId(null);
  };

  const monthData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: chartMonths }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (chartMonths - 1 - index), 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const entries = transactions.filter((item) => item.date.slice(0, 7) === key);
      return {
        key,
        label: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
        year: String(date.getFullYear()).slice(-2),
        income: entries.filter((item) => item.type === "Entrada").reduce((sum, item) => sum + item.amount, 0),
        expenses: entries.filter((item) => item.type === "Saída").reduce((sum, item) => sum + item.amount, 0),
      };
    });
  }, [transactions, chartMonths]);
  const chartMax = Math.max(1, ...monthData.flatMap((month) => [month.income, month.expenses]));

  return (
    <div className="flex min-h-screen bg-slate-50 text-[#1f2937]">
      <NavBar option="CASHFLOW" />
      <main className="min-w-0 flex-1 px-8 py-10 max-xl:px-6 max-md:px-4">
        <div className="mx-auto max-w-[1440px]">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className={"flex flex-col items-start gap-2.5"}>
              <div className={"rounded-2xl p-2.5 shadow-[0_0_4px_#00000040]"}>
                <h1 className={"text-4xl font-bold text-black"}>
                  Fluxo de Caixa
                </h1>
              </div>
              <p className="text-secondary-text mt-2 text-sm">
                Acompanhe as entradas, saídas e o resultado financeiro.
              </p>
            </div>
            <button onClick={openNew} className={primaryButton}>
              <span className="mr-2 text-lg">＋</span> Nova movimentação
            </button>
          </header>

          {isOwner && (
            <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <SummaryCard
                title="Saldo do período"
                value={money(balance)}
                detail="Entradas menos saídas"
              />
              <SummaryCard
                title="Total de entradas"
                value={money(totals.income)}
                detail="Receitas registradas"
              />
              <SummaryCard
                title="Total de saídas"
                value={money(totals.expenses)}
                detail="Despesas registradas"
              />
            </section>
          )}

          {isOwner && (
            <section className="border-input-stroke mb-7 rounded-[15px] border bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Movimentação financeira</h2>
                  <p className="text-secondary-text mt-1 text-xs">
                    Comparativo dos últimos {chartMonths} meses
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="text-secondary-text flex items-center gap-2 text-xs">
                    Período
                    <select
                      aria-label="Quantidade de meses do gráfico"
                      value={chartMonths}
                      onChange={(e) =>
                        setChartMonths(
                          Number(e.target.value) as 6 | 12 | 18 | 24,
                        )
                      }
                      className="border-input-stroke focus:border-accent-color h-9 rounded-lg border bg-white px-2 text-xs text-[#1f2937] outline-none"
                    >
                      <option value={6}>6 meses</option>
                      <option value={12}>12 meses</option>
                      <option value={18}>18 meses</option>
                      <option value={24}>24 meses</option>
                    </select>
                  </label>
                  <div className="text-secondary-text flex flex-wrap items-center gap-4 text-xs">
                    <span className="flex items-center gap-2">
                      <i className="size-2.5 rounded-full bg-emerald-500" />{" "}
                      Entradas
                    </span>
                    <span className="flex items-center gap-2">
                      <i className="size-2.5 rounded-full bg-rose-400" /> Saídas
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto border-b border-slate-100 pb-2">
                <div
                  className="flex h-[190px] min-w-full gap-3"
                  style={{
                    width: chartMonths <= 12 ? "100%" : `${chartMonths * 76}px`,
                    minWidth: `${chartMonths * 76}px`,
                    justifyContent: chartMonths <= 12 ? "center" : "flex-start",
                  }}
                >
                  {monthData.map((month) => (
                    <div
                      key={month.key}
                      className="flex w-[64px] shrink-0 flex-col items-center justify-end gap-2"
                    >
                      <div className="flex h-[155px] w-full items-end justify-center gap-1.5">
                        <div
                          title={`Entradas: ${money(month.income)}`}
                          className="w-[min(25px,40%)] rounded-t-md bg-emerald-500 transition-all"
                          style={{
                            height: `${Math.max(month.income > 0 ? 4 : 0, (month.income / chartMax) * 100)}%`,
                          }}
                        />
                        <div
                          title={`Saídas: ${money(month.expenses)}`}
                          className="w-[min(25px,40%)] rounded-t-md bg-rose-400 transition-all"
                          style={{
                            height: `${Math.max(month.expenses > 0 ? 4 : 0, (month.expenses / chartMax) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-secondary-text text-[11px] capitalize">
                        {month.label}/{month.year}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {transactions.length === 0 && (
                <p className="text-secondary-text mt-3 text-center text-xs">
                  Cadastre movimentações para visualizar o comparativo mensal.
                </p>
              )}
            </section>
          )}

          <section className="border-input-stroke overflow-hidden rounded-[15px] border bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e7ebf3] p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-bold">
                  Histórico de movimentações
                </h2>
                <p className="text-secondary-text mt-1 text-xs">
                  {filtered.length}{" "}
                  {filtered.length === 1
                    ? "lançamento encontrado"
                    : "lançamentos encontrados"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label="Filtrar período"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className="border-input-stroke focus:border-accent-color h-10 rounded-lg border bg-white px-3 text-xs outline-none"
                >
                  <option value="month">Este mês</option>
                  <option value="year">Este ano</option>
                  <option value="all">Todo o período</option>
                </select>
                <select
                  aria-label="Filtrar tipo"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border-input-stroke focus:border-accent-color h-10 rounded-lg border bg-white px-3 text-xs outline-none"
                >
                  <option>Todos</option>
                  <option>Entrada</option>
                  <option>Saída</option>
                </select>
              </div>
            </div>
            <div className="border-b border-[#e7ebf3] p-4 sm:px-6">
              <label className="border-input-stroke text-secondary-text flex h-10 max-w-[420px] items-center gap-2 rounded-lg border px-3">
                <span className="text-lg">⌕</span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por descrição ou categoria"
                  className="placeholder:text-secondary-text w-full bg-transparent text-xs text-[#1f2937] outline-none"
                />
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                <thead className="bg-accent-color text-xs font-semibold text-white">
                  <tr>
                    {[
                      "Descrição",
                      "Categoria",
                      "Data",
                      "Tipo",
                      "Valor",
                      "Ações",
                    ].map((heading) => (
                      <th key={heading} className="px-5 py-4">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-[#e7ebf3] transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 font-semibold">
                        {item.description}
                      </td>
                      <td className="text-secondary-text px-5 py-4">
                        {item.category}
                      </td>
                      <td className="text-secondary-text px-5 py-4">
                        {dateLabel(item.date)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${item.type === "Entrada" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-4 font-semibold tabular-nums ${item.type === "Entrada" ? "text-emerald-700" : "text-rose-600"}`}
                      >
                        {item.type === "Entrada" ? "+ " : "− "}
                        {money(item.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            aria-label={`Editar ${item.description}`}
                            className="text-accent-color grid size-8 place-items-center rounded-lg bg-slate-100 transition hover:bg-blue-100"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => setDeletingId(item.id)}
                            aria-label={`Excluir ${item.description}`}
                            className="grid size-8 place-items-center rounded-lg bg-slate-100 text-rose-600 transition hover:bg-rose-100"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="px-5 py-14 text-center">
                  <div className="text-secondary-text mx-auto mb-3 grid size-12 place-items-center rounded-full bg-slate-100 text-xl">
                    R$
                  </div>
                  <p className="font-semibold">
                    Nenhuma movimentação encontrada
                  </p>
                  <p className="text-secondary-text mt-1 text-xs">
                    Tente alterar os filtros ou cadastre uma nova movimentação.
                  </p>
                  <button
                    onClick={openNew}
                    className="text-accent-color mt-4 text-sm font-semibold"
                  >
                    Adicionar movimentação
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {formOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <form
            onSubmit={saveTransaction}
            className="my-auto w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? "Editar movimentação" : "Nova movimentação"}
                </h2>
                <p className="text-secondary-text mt-1 text-xs">
                  Informe os dados do lançamento financeiro.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Fechar"
                className="text-secondary-text grid size-8 place-items-center rounded-lg text-xl hover:bg-slate-100"
              >
                ×
              </button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <label className="text-secondary-text text-xs font-semibold sm:col-span-2">
                Descrição
                <input
                  autoFocus
                  required
                  maxLength={100}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                  placeholder="Ex.: Venda de produtos"
                  className={fieldClass}
                />
              </label>
              <label className="text-secondary-text text-xs font-semibold">
                Tipo
                <select
                  value={draft.type}
                  onChange={(e) => {
                    const type = e.target.value as TransactionType;
                    setDraft({ ...draft, type, category: categories[type][0] });
                  }}
                  className={fieldClass}
                >
                  <option>Entrada</option>
                  <option>Saída</option>
                </select>
              </label>
              <label className="text-secondary-text text-xs font-semibold">
                Categoria
                <select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value })
                  }
                  className={fieldClass}
                >
                  {categories[draft.type].map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="text-secondary-text text-xs font-semibold">
                Valor (R$)
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={draft.amount || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, amount: Number(e.target.value) })
                  }
                  placeholder="0,00"
                  className={fieldClass}
                />
              </label>
              <label className="text-secondary-text text-xs font-semibold">
                Data
                <input
                  required
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                  className={fieldClass}
                />
              </label>
              {formError && (
                <p
                  role="alert"
                  className="text-xs font-medium text-rose-600 sm:col-span-2"
                >
                  {formError}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
              <button
                type="button"
                onClick={closeForm}
                className={secondaryButton}
              >
                Cancelar
              </button>
              <button type="submit" className={primaryButton}>
                {editingId ? "Salvar alterações" : "Adicionar lançamento"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="delete-title" className="text-lg font-bold">
              Excluir movimentação?
            </h2>
            <p className="text-secondary-text mt-2 text-sm leading-6">
              Essa ação removerá o lançamento do histórico e atualizará os
              totais financeiros. Não é possível desfazê-la.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className={secondaryButton}
              >
                Cancelar
              </button>
              <button
                onClick={removeTransaction}
                className="inline-flex h-10 items-center justify-center rounded-[9px] bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, detail, tone, icon }: { title: string; value: string; detail: string; tone: "blue" | "green" | "red"; icon: string }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
  };
  return <article className="rounded-[15px] border border-input-stroke bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between"><p className="text-sm font-medium text-secondary-text">{title}</p><span className={`grid size-10 place-items-center rounded-xl text-sm font-bold ${styles[tone]}`}>{icon}</span></div>
    <p className="mt-4 text-[26px] font-bold tracking-tight text-[#202938] max-sm:text-[22px]">{value}</p><p className="mt-1 text-xs text-secondary-text">{detail}</p>
  </article>;
}
