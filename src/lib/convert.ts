import type { BalanceCheck } from "@/lib/balance";
import { checkBalance } from "@/lib/balance";
import type { Classification } from "@/lib/pdf/classify";
import type { ExtractedPdf } from "@/lib/pdf/extract";
import type { Statement } from "@/lib/statement";
import { scanWithLlm } from "@/lib/llm/scan";

export type ConvertResult = {
  statement: Statement;
  balance: BalanceCheck;
};

const UNCHARGED_READ_ERROR =
  "Nao conseguimos ler este extrato. Nada foi cobrado. Tente outro arquivo.";
const CHARGED_READ_ERROR =
  "Nao conseguimos concluir esta conversao. Se a conferencia nao aparecer, envie o arquivo de novo.";

export function convertFailureCopy(charged: boolean): string {
  return charged ? CHARGED_READ_ERROR : UNCHARGED_READ_ERROR;
}

function emptyStatement(bank = "other"): Statement {
  return {
    bank,
    kind: "conta",
    transactions: [],
  };
}

function hasTransactions(statement: Statement | null): statement is Statement {
  return Boolean(statement && statement.transactions.length > 0);
}

export async function convertExtracted(
  extracted: ExtractedPdf,
  options: {
    classification: Classification;
    fileBuffer?: Buffer;
    mimeType?: string;
    scanWithLlmFn?: typeof scanWithLlm;
  },
): Promise<ConvertResult> {
  const scanFn = options.scanWithLlmFn ?? scanWithLlm;

  const llmStatement = await scanFn({
    extracted,
    imageBuffer: options.fileBuffer,
    mimeType: options.mimeType,
  });

  const statement = hasTransactions(llmStatement)
    ? llmStatement
    : emptyStatement(options.classification.bank);

  return {
    statement,
    balance: checkBalance(statement),
  };
}

export { checkBalance, sumCents } from "@/lib/balance";
