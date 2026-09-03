import { balanceGapLabel, type BalanceCheck } from "@/lib/balance";
import type { Statement } from "@/lib/statement";

function formatAmount(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}

function escapeOfx(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

export function toOfx(
  statement: Statement,
  balance: BalanceCheck,
): string {
  const now = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
  const transactions = statement.transactions
    .map((tx, index) => {
      const fitId = `${tx.date}|${tx.description}|${tx.amountCents}|${index}`;
      return `<STMTTRN>
<TRNTYPE>${tx.amountCents >= 0 ? "CREDIT" : "DEBIT"}</TRNTYPE>
<DTPOSTED>${tx.date.replace(/-/g, "")}</DTPOSTED>
<TRNAMT>${formatAmount(tx.amountCents)}</TRNAMT>
<FITID>${escapeOfx(fitId)}</FITID>
<NAME>${escapeOfx(tx.description)}</NAME>
</STMTTRN>`;
    })
    .join("\n");

  return `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<CURDEF>BRL</CURDEF>
<BANKACCTFROM>
<BANKID>000</BANKID>
<ACCTID>000000</ACCTID>
<ACCTTYPE>CHECKING</ACCTTYPE>
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>${now}</DTSTART>
<DTEND>${now}</DTEND>
${transactions}
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>${
    balance.ok
      ? ""
      : `\n<!-- AVISO: saldo nao fecha. ${balanceGapLabel(balance)}. Nao importe sem revisar. -->`
  }`;
}
