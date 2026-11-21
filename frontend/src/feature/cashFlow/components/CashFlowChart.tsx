import { useMemo } from "react";
import { buildBuckets, type PeriodRange } from "../../../core/Period.ts";
import type { Transaction } from "../../../service/cashFlowService.ts";
import { money } from "./cashFlowFormat.ts";
import { LoadingState, LoadErrorState } from "./CashFlowStates";

const chartCurrency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

type ChartBucket = {
  key: string;
  label: string;
  income: number;
  expenses: number;
};

type CashFlowChartProps = {
  periodTransactions: Transaction[];
  range: PeriodRange;
  periodLabel: string;
  isLoading: boolean;
  loadError: string | null;
  onRetry: () => void;
  onNew: () => void;
};

export default function CashFlowChart({
  periodTransactions,
  range,
  periodLabel,
  isLoading,
  loadError,
  onRetry,
  onNew,
}: CashFlowChartProps) {
  const isDaily = range.start === range.end;

  const chartData = useMemo<ChartBucket[]>(() => {
    const buckets = buildBuckets(range).map((bucket) => ({
      ...bucket,
      income: 0,
      expenses: 0,
    }));

    for (const bucket of buckets) {
      for (const item of periodTransactions) {
        if (!item.date.startsWith(bucket.key)) continue;

        if (item.type === "Entrada") {
          bucket.income += item.amount;
        } else {
          bucket.expenses += item.amount;
        }
      }
    }

    return buckets;
  }, [range, periodTransactions]);

  const chartMax = Math.max(
    1,
    ...chartData.flatMap((bucket) => [bucket.income, bucket.expenses]),
  );

  const chartIsEmpty = chartData.every(
    (bucket) => bucket.income === 0 && bucket.expenses === 0,
  );

  return (
    <section className="border-input-stroke mb-7 rounded-[15px] border bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Movimentação financeira</h2>
          <p className="text-secondary-text mt-1 text-xs">
            {isDaily ? "Comparativo diário" : "Comparativo mensal"}.{" "}
            {periodLabel.toLocaleLowerCase("pt-BR")}
          </p>
        </div>

        <div className="text-secondary-text flex flex-wrap items-center gap-4 text-xs">
          <span className="flex items-center gap-2">
            <i className="size-2.5 rounded-full bg-emerald-500" />
            Entradas
          </span>
          <span className="flex items-center gap-2">
            <i className="size-2.5 rounded-full bg-rose-400" />
            Saídas
          </span>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : loadError ? (
        <LoadErrorState message={loadError} onRetry={onRetry} />
      ) : chartIsEmpty ? (
        <div className="px-5 py-14 text-center">
          <div className="text-secondary-text mx-auto mb-3 grid size-12 place-items-center rounded-full bg-slate-100 text-xl">
            R$
          </div>
          <p className="font-semibold">Nenhuma movimentação encontrada</p>
          <p className="text-secondary-text mt-1 text-xs">
            Tente alterar os filtros ou cadastre uma nova movimentação.
          </p>
          <button
            type="button"
            onClick={onNew}
            className="text-accent-color mt-4 text-sm font-semibold"
          >
            Adicionar movimentação
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border-b border-slate-100 pb-2">
          <div className="flex w-max min-w-full justify-center gap-3 px-2 pt-6">
            {chartData.map((bucket) => (
              <div
                key={bucket.key}
                className="flex min-w-12 shrink-0 flex-col items-center gap-2"
              >
                <div className="flex h-[155px] items-end justify-center gap-2">
                  {(["income", "expenses"] as const).map((series) => {
                    const value = bucket[series];
                    if (value <= 0) return null;

                    const isIncome = series === "income";
                    const height = Math.max(4, (value / chartMax) * 100);

                    return (
                      <div
                        key={series}
                        title={`${isIncome ? "Entradas" : "Saídas"}: ${money(value)}`}
                        className="flex flex-col items-center justify-end gap-1"
                        style={{ height: `${height}%` }}
                      >
                        <span className="shrink-0 text-[11px] font-medium whitespace-nowrap text-[#111827]">
                          {chartCurrency.format(value)}
                        </span>
                        <div
                          className={`h-full w-[25px] shrink-0 rounded-t-md transition-all ${
                            isIncome ? "bg-emerald-500" : "bg-rose-400"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                <span className="text-secondary-text text-[11px] capitalize">
                  {bucket.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
