export type BarDatum = {
  key: string;
  label: string;
  value: number;
  valueLabel: string;
  title: string;
};

type StatsBarChartProps = {
  title: string;
  subtitle?: string;
  data: BarDatum[];
  emptyMessage: string;
};

const MAX_LABELED_BARS = 12;

const StatsBarChart = ({
  title,
  subtitle,
  data,
  emptyMessage,
}: StatsBarChartProps) => {
  const max = Math.max(1, ...data.map((bar) => bar.value));
  const isEmpty = data.every((bar) => bar.value === 0);
  const showValues = data.length <= MAX_LABELED_BARS;

  return (
    <section className="border-input-stroke rounded-[15px] border bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      {subtitle && (
        <p className="text-secondary-text mt-1 text-xs">{subtitle}</p>
      )}

      {isEmpty ? (
        <p className="text-secondary-text py-16 text-center text-xs">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto pb-2">
          <div className="flex min-w-full items-end justify-around gap-3">
            {data.map((bar) => (
              <div
                key={bar.key}
                title={bar.title}
                className="flex min-w-[48px] flex-1 flex-col items-center gap-2 pt-6"
              >
                <div className="flex h-[170px] w-full items-end justify-center">
                  <div
                    className="bg-accent-color relative w-[min(32px,60%)] rounded-t-md transition-all"
                    style={{
                      height: `${bar.value > 0 ? Math.max(4, (bar.value / max) * 100) : 0}%`,
                    }}
                  >
                    {(showValues || bar.value > 0) && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-medium whitespace-nowrap text-[#111827]">
                        {bar.valueLabel}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-secondary-text text-center text-[11px] capitalize">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default StatsBarChart;
