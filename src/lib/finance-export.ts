import { formatBRL } from "@/hooks/use-finance";
import type { Transaction, Account } from "@/lib/finance-types";
import { format } from "date-fns";

const accName = (accounts: Account[], id: string) => accounts.find((a) => a.id === id)?.name ?? "—";

export function exportTransactionsCSV(transactions: Transaction[], accounts: Account[], label = "extrato") {
  const header = ["Data", "Tipo", "Categoria", "Descrição", "Conta", "Tags", "Valor"];
  const rows = transactions.map((t) => [
    format(new Date(t.date), "dd/MM/yyyy"),
    t.type === "income" ? "Receita" : "Despesa",
    t.category,
    (t.description ?? "").replace(/"/g, '""'),
    accName(accounts, t.accountId),
    (t.tags ?? []).join("; "),
    (t.type === "income" ? t.amount : -t.amount).toFixed(2).replace(".", ","),
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c)}"`).join(";"))
    .join("\n");
  // BOM para Excel
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${label}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportTransactionsPDF(
  transactions: Transaction[],
  accounts: Account[],
  title = "Extrato Financeiro",
  subtitle?: string,
) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(subtitle ?? format(new Date(), "dd/MM/yyyy"), 14, 25);

  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  doc.setTextColor(20);
  doc.text(`Receitas: ${formatBRL(income)}`, 14, 32);
  doc.text(`Despesas: ${formatBRL(expense)}`, 70, 32);
  doc.text(`Resultado: ${formatBRL(income - expense)}`, 130, 32);

  autoTable(doc, {
    startY: 38,
    head: [["Data", "Tipo", "Categoria", "Descrição", "Conta", "Valor"]],
    body: transactions.map((t) => [
      format(new Date(t.date), "dd/MM/yyyy"),
      t.type === "income" ? "Receita" : "Despesa",
      t.category,
      t.description ?? "",
      accName(accounts, t.accountId),
      formatBRL(t.type === "income" ? t.amount : -t.amount),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [201, 168, 76], textColor: 20 },
    alternateRowStyles: { fillColor: [245, 243, 238] },
  });

  doc.save(`extrato-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}
