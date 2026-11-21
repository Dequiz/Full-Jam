type OrderSummaryCardsProps = {
  totalCount: number;
  pendingCount: number;
  inProgressCount: number;
  deliveredCount: number;
  activeStatusFilter: string;
  onSelectStatus: (status: string) => void;
};

const OrderSummaryCards = ({
  totalCount,
  pendingCount,
  inProgressCount,
  deliveredCount,
  activeStatusFilter,
  onSelectStatus,
}: OrderSummaryCardsProps) => {
  const cards = [
    { label: "Todos os pedidos", count: totalCount, filterValue: "" },
    { label: "Pendentes", count: pendingCount, filterValue: "Pendente" },
    {
      label: "Em andamento",
      count: inProgressCount,
      filterValue: "Em andamento",
    },
    { label: "Entregues", count: deliveredCount, filterValue: "Entregue" },
  ];

  return (
    <div className="mb-[26px] grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const isSelected = activeStatusFilter === card.filterValue;

        return (
          <button
            key={card.label}
            type="button"
            onClick={() =>
              onSelectStatus(
                isSelected && card.filterValue !== "" ? "" : card.filterValue,
              )
            }
            className={`group flex min-h-[128px] cursor-pointer flex-col justify-between rounded-[16px] border bg-white p-6 text-left shadow-[0_6px_20px_rgba(20,32,61,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(57,92,235,0.12)] ${
              isSelected && card.filterValue !== ""
                ? "border-accent-color ring-accent-color/20 ring-2"
                : "border-[#e7ebf3]"
            }`}
          >
            <span className="text-accent-color text-[15px] font-semibold">
              {card.label}
            </span>
            <strong className="mt-3 text-[34px] leading-none font-bold text-[#111827]">
              {card.count}
            </strong>
          </button>
        );
      })}
    </div>
  );
};

export default OrderSummaryCards;
