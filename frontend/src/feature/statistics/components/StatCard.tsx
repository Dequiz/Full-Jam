type StatCardProps = {
  label: string;
  value: string;
  negative?: boolean;
};

const StatCard = ({ label, value, negative = false }: StatCardProps) => (
  <article className="flex min-h-[128px] flex-col justify-between rounded-[16px] border border-[#e7ebf3] bg-white p-6 shadow-[0_6px_20px_rgba(20,32,61,0.06)]">
    <span className="text-accent-color text-[15px] font-semibold">{label}</span>
    <strong
      className={`mt-3 text-[30px] leading-none font-bold max-sm:text-[26px] ${
        negative ? "text-destructive-color" : "text-[#111827]"
      }`}
    >
      {value}
    </strong>
  </article>
);

export default StatCard;
