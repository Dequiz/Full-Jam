import type { TopProduct } from "../../../service/statisticsService.ts";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const percent = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const HEADERS: { label: string; align: "left" | "center" }[] = [
  { label: "#", align: "left" },
  { label: "Produto", align: "left" },
  { label: "Quantidade vendida", align: "center" },
  { label: "Receita", align: "center" },
  { label: "% da receita", align: "center" },
];

type TopProductsTableProps = {
  products: TopProduct[];
};

const TopProductsTable = ({ products }: TopProductsTableProps) => (
  <section>
    <h2 className="mb-4 text-[22px] font-bold text-[#1f2937]">
      Top 5 - Produtos mais vendidos
    </h2>

    <div className="overflow-x-auto rounded-t-[15px] border-b border-[#395CEB] bg-white">
      <table className="w-full min-w-[680px] border-collapse text-[15px]">
        <caption className="sr-only">Cinco produtos mais vendidos</caption>
        <thead className="bg-accent-color text-[15px] font-semibold text-white">
          <tr>
            {HEADERS.map(({ label, align }) => (
              <th
                key={label}
                className={`px-6 py-5 ${
                  align === "center" ? "text-center" : "text-left"
                }`}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr
              key={product.productId}
              className="border-t border-[#9fb2ff] transition-colors hover:bg-slate-50/70"
            >
              <td className="px-6 py-4 font-medium">{index + 1}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3.5">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={`Foto de ${product.name}`}
                      className="h-12 w-16 rounded-[6px] object-cover"
                    />
                  ) : (
                    <div className="h-12 w-16 rounded-[6px] bg-slate-100" />
                  )}
                  <div>
                    <p className="font-semibold text-[#111827]">
                      {product.name}
                    </p>
                    <p className="text-secondary-text text-[11px]">
                      {product.code}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-center">{product.quantity} un.</td>
              <td className="px-6 py-4 text-center">
                {formatCurrency(product.revenue)}
              </td>
              <td className="px-6 py-4 text-center">
                {percent.format(product.share)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {products.length === 0 && (
        <p className="text-secondary-text p-8 text-center text-[13px]">
          Nenhum produto vendido no período.
        </p>
      )}
    </div>
  </section>
);

export default TopProductsTable;
