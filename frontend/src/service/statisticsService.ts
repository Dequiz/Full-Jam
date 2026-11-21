import { buildBuckets, isInRange, type PeriodRange } from "../core/Period.ts";
import { cashFlowService, type Transaction } from "./cashFlowService.ts";
import {
  orderService,
  type Order,
  type OrderStatusUI,
} from "./orderService.ts";

const SOLD_STATUS: OrderStatusUI = "Entregue";

const STATUS_ORDER: OrderStatusUI[] = [
  "Pendente",
  "Em andamento",
  "Entregue",
  "Cancelado",
];

const TOP_PRODUCTS_LIMIT = 5;

export type StatisticsData = {
  orders: Order[];
  transactions: Transaction[];
};

export type SalesBucket = { key: string; label: string; value: number };

export type TopProduct = {
  productId: string;
  name: string;
  code: string;
  image?: string;
  quantity: number;
  revenue: number;
  share: number;
};

export type Statistics = {
  ordersCount: number;
  profit: number;
  loss: number;
  statusCounts: { status: OrderStatusUI; count: number }[];
  sales: SalesBucket[];
  topProducts: TopProduct[];
};

export const statisticsService = {
  getStatisticsData: async (): Promise<StatisticsData> => {
    const [orders, transactions] = await Promise.all([
      orderService.getOrders(),
      cashFlowService.getTransactions(),
    ]);
    return { orders, transactions };
  },
};

export const computeStatistics = (
  data: StatisticsData,
  range: PeriodRange,
): Statistics => {
  const periodOrders = data.orders.filter((order) =>
    isInRange(order.orderDate, range),
  );
  const soldOrders = periodOrders.filter(
    (order) => order.status === SOLD_STATUS,
  );

  const statusCounts = STATUS_ORDER.map((status) => ({
    status,
    count: periodOrders.filter((order) => order.status === status).length,
  }));

  const sales: SalesBucket[] = buildBuckets(range).map((bucket) => ({
    ...bucket,
    value: 0,
  }));
  for (const bucket of sales) {
    for (const order of soldOrders) {
      if (order.orderDate.startsWith(bucket.key)) {
        bucket.value += order.totalValue;
      }
    }
  }

  const products = new Map<string, TopProduct>();
  let totalRevenue = 0;
  for (const order of soldOrders) {
    for (const item of order.items) {
      const entry = products.get(item.productId) ?? {
        productId: item.productId,
        name: item.productName,
        code: item.productCode,
        image: item.productImage,
        quantity: 0,
        revenue: 0,
        share: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += item.subtotal;
      totalRevenue += item.subtotal;
      products.set(item.productId, entry);
    }
  }

  const topProducts = Array.from(products.values())
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, TOP_PRODUCTS_LIMIT)
    .map((product) => ({
      ...product,
      share: totalRevenue > 0 ? product.revenue / totalRevenue : 0,
    }));

  let income = 0;
  let expenses = 0;
  for (const transaction of data.transactions) {
    if (!isInRange(transaction.date, range)) continue;
    if (transaction.type === "Entrada") income += transaction.amount;
    else expenses += transaction.amount;
  }

  return {
    ordersCount: periodOrders.length,
    profit: income - expenses,
    loss: expenses,
    statusCounts,
    sales,
    topProducts,
  };
};
