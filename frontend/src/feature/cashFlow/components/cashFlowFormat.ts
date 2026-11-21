export const money = (value: number | undefined) =>
  value != undefined
    ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "";

export const dateLabel = (value: string | undefined) =>
  value != undefined
    ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");
