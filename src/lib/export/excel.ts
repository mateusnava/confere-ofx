import ExcelJS from "exceljs";
import { balanceGapLabel, type BalanceCheck } from "@/lib/balance";
import type { Statement } from "@/lib/statement";

export async function toXlsx(
  statement: Statement,
  balance: BalanceCheck,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();

  if (!balance.ok) {
    const warning = workbook.addWorksheet("Aviso");
    warning.addRow([
      `Saldo nao fecha. ${balanceGapLabel(balance)}. Revise os lancamentos antes de importar.`,
    ]);
  }

  const sheet = workbook.addWorksheet("Extrato");
  sheet.addRow(["data", "descricao", "valor_centavos"]);
  for (const tx of statement.transactions) {
    sheet.addRow([tx.date, tx.description, tx.amountCents]);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
