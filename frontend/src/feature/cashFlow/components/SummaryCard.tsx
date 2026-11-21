import { money } from "./cashFlowFormat";

type SummaryCardProps = {
  title: string;
  value: number | null;
  detail: string;
};

export default function SummaryCard({
  title,
  value,
  detail,
}: SummaryCardProps) {
  return (
    <article className="border-input-stroke rounded-[15px] border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-secondary-text text-sm font-medium">{title}</p>
      </div>
      <p
        className={`mt-4 text-[26px] font-bold tracking-tight ${
          (value ?? 0) >= 0 ? "text-[#202938]" : "text-destructive-color"
        } max-sm:text-[22px]`}
      >
        {value === null ? "—" : money(value)}
      </p>
      <p className="text-secondary-text mt-1 text-xs">{detail}</p>
    </article>
  );
}
