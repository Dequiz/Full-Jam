import EditButton from "../../../core/EditButton.tsx";
import type { Order, OrderStatusUI } from "../../../service/orderService.ts";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDatePtBr = (isoDate: string): string => {
  const clean = isoDate.slice(0, 10);
  const parts = clean.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const getStatusBadgeClasses = (status: OrderStatusUI): string => {
  if (status === "Entregue") {
    return "bg-active-status-bg text-active-status-text";
  }
  if (status === "Cancelado") {
    return "bg-[#fff1f1] text-destructive-color";
  }
  return "bg-pending-status-bg text-pending-status-text";
};

type OrderTableRowProps = {
  order: Order;
  onEdit: (orderId: string) => void;
};

const OrderTableRow = ({ order, onEdit }: OrderTableRowProps) => {
  const itemsSummaryTitle =
    order.items.length > 0
      ? order.items
          .map((item) => `${item.quantity}x ${item.productName}`)
          .join(", ")
      : "Sem itens";

  const itemsLabel =
    order.items.length === 1
      ? `${order.items[0].productName} (${order.items[0].quantity} un.)`
      : "Itens diversos";

  return (
    <tr className="border-t border-[#9fb2ff] transition-colors hover:bg-slate-50/70">
      <td className="px-6 py-4 font-medium" title={order.id}>
        {order.displayCode}
      </td>
      <td className="px-6 py-4 text-center">{order.customerName}</td>
      <td className="px-6 py-4 text-center">
        {formatDatePtBr(order.orderDate)}
      </td>
      <td className="px-6 py-4 text-center" title={itemsSummaryTitle}>
        {itemsLabel}
      </td>
      <td className="px-6 py-4 text-center">
        {formatCurrency(order.totalValue)}
      </td>
      <td className="px-6 py-4 text-center">
        <span
          className={`inline-block rounded-full px-3.5 py-1 text-xs font-semibold ${getStatusBadgeClasses(
            order.status,
          )}`}
        >
          {order.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-center">
          <EditButton objectToEdit={{ id: order.id }} onEdit={onEdit} />
        </div>
      </td>
    </tr>
  );
};

export default OrderTableRow;
