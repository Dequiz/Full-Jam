import { useCallback, useEffect, useMemo, useState } from "react";
import { PulseLoader } from "react-spinners";
import { useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import NavBar from "../../navbar/NavBar.tsx";
import type { RouteContext } from "../../../routes/ProtectedRoute.tsx";
import {
  getPeriodRange,
  periodOptions,
  type Period,
} from "../../../core/Period.ts";
import {
  computeStatistics,
  statisticsService,
  type StatisticsData,
} from "../../../service/statisticsService.ts";
import StatCard from "../components/StatCard.tsx";
import StatsBarChart, { type BarDatum } from "../components/StatsBarChart.tsx";
import TopProductsTable from "../components/TopProductsTable.tsx";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const compactCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

const Statistics = () => {
  const context = useOutletContext<RouteContext | undefined>();
  const isOwner = context?.role === "PROPRIETARIO";

  const [period, setPeriod] = useState<Period>("month");
  const [data, setData] = useState<StatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(isOwner);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setData(await statisticsService.getStatisticsData());
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as estatísticas.",
      );
      toast.error("Erro ao consultar as estatísticas no banco de dados.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOwner) void fetchData();
  }, [isOwner, fetchData]);

  const retryFetch = () => {
    setIsLoading(true);
    setLoadError(null);
    void fetchData();
  };

  const range = useMemo(
    () =>
      getPeriodRange(
        period,
        data
          ? [
              ...data.orders.map((order) => order.orderDate),
              ...data.transactions.map((item) => item.date),
            ]
          : [],
      ),
    [period, data],
  );

  const stats = useMemo(
    () => (data ? computeStatistics(data, range) : null),
    [data, range],
  );

  const isDaily = range.start === range.end;
  const periodLabel =
    periodOptions.find((option) => option.value === period)?.label ?? "";

  const salesBars: BarDatum[] = (stats?.sales ?? []).map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    value: bucket.value,
    valueLabel: compactCurrency.format(bucket.value),
    title: `${bucket.label}: ${formatCurrency(bucket.value)}`,
  }));

  const statusBars: BarDatum[] = (stats?.statusCounts ?? []).map(
    ({ status, count }) => ({
      key: status,
      label: status,
      value: count,
      valueLabel: String(count),
      title: `${status}: ${count}`,
    }),
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-[#1f2937]">
      <NavBar option="STATISTICS" />
      <main className="min-w-0 flex-1 px-8 py-10 max-xl:px-6 max-md:px-4">
        <div className="mx-auto max-w-360">
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col items-start gap-2.5">
              <div className="rounded-2xl p-2.5 shadow-[0_0_4px_#00000040]">
                <h1 className="text-4xl font-bold text-black">Estatísticas</h1>
              </div>
              <p className="text-secondary-text mt-2 text-sm">
                Acompanhe pedidos, resultado financeiro e produtos em destaque.
              </p>
            </div>
            {isOwner && (
              <label className="text-secondary-text flex items-center gap-2 text-xs">
                Período
                <select
                  aria-label="Filtrar período da página"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className="border-input-stroke focus:border-accent-color h-11 rounded-[10px] border bg-white px-3 text-sm text-[#1f2937] outline-none"
                >
                  {periodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </header>

          {!isOwner ? (
            <p className="text-secondary-text rounded-[15px] border border-[#e7ebf3] bg-white p-8 text-center text-sm">
              Esta página é restrita ao proprietário.
            </p>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[15px] border border-[#e7ebf3] bg-white p-12">
              <PulseLoader color="#395CEB" size={10} />
              <p className="text-secondary-text text-[13px]">
                Carregando estatísticas...
              </p>
            </div>
          ) : loadError || !stats ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-[15px] border border-[#e7ebf3] bg-white p-10 text-center">
              <p className="text-destructive-color text-[13px]">
                Não foi possível carregar as estatísticas (
                {loadError ?? "sem dados"}).
              </p>
              <button
                type="button"
                onClick={retryFetch}
                className="text-accent-color cursor-pointer text-[13px] font-semibold underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="space-y-7">
              <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard label="Pedidos" value={String(stats.ordersCount)} />
                <StatCard
                  label="Entrada"
                  value={formatCurrency(stats.profit)}
                  negative={stats.profit < 0}
                />
                <StatCard label="Saída" value={formatCurrency(stats.loss)} />
              </section>

              <section className="grid gap-5 lg:grid-cols-2">
                <StatsBarChart
                  title={
                    isDaily
                      ? "Vendas por dia (em R$)"
                      : "Vendas por mês (em R$)"
                  }
                  subtitle={`Pedidos entregues • ${periodLabel.toLocaleLowerCase("pt-BR")}`}
                  data={salesBars}
                  emptyMessage="Nenhuma venda entregue no período."
                />
                <StatsBarChart
                  title="Status dos pedidos"
                  subtitle={periodLabel}
                  data={statusBars}
                  emptyMessage="Nenhum pedido no período."
                />
              </section>

              <TopProductsTable products={stats.topProducts} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Statistics;
