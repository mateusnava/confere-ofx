import type { BalanceCheck } from "@/lib/balance";
import type { Statement } from "@/lib/statement";

type PreviewProps = {
  statement: Statement;
  balance: BalanceCheck;
  sessionId: string;
};

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function Preview({ statement, balance, sessionId }: PreviewProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Preview do extrato</h2>
          <p className="text-sm text-slate-500">
            {statement.bank.toUpperCase()} · {statement.kind}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            balance.ok
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {balance.ok ? "Saldo fecha" : "Saldo nao fecha"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase text-slate-500">Abertura</p>
          <p className="mt-1 font-medium">
            {statement.openingBalanceCents !== undefined
              ? formatMoney(statement.openingBalanceCents)
              : "-"}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase text-slate-500">Soma</p>
          <p className="mt-1 font-medium">{formatMoney(balance.sumCents)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs uppercase text-slate-500">Fechamento</p>
          <p className="mt-1 font-medium">
            {statement.closingBalanceCents !== undefined
              ? formatMoney(statement.closingBalanceCents)
              : "-"}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="py-2 pr-4">Data</th>
              <th className="py-2 pr-4">Descricao</th>
              <th className="py-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {statement.transactions.map((tx) => (
              <tr key={`${tx.date}-${tx.description}-${tx.amountCents}`} className="border-b border-slate-100">
                <td className="py-2 pr-4">{tx.date}</td>
                <td className="py-2 pr-4">{tx.description}</td>
                <td className="py-2">{formatMoney(tx.amountCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {balance.ok ? (
          <a
            href={`/api/export?sessionId=${sessionId}&format=ofx`}
            className="rounded-full bg-[#0F6B5C] px-4 py-2 text-sm font-semibold text-white"
          >
            Baixar OFX
          </a>
        ) : (
          <span className="rounded-full bg-slate-200 px-4 py-2 text-sm text-slate-600">
            OFX bloqueado ate o saldo fechar
          </span>
        )}
        <a
          href={`/api/export?sessionId=${sessionId}&format=csv`}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Baixar CSV
        </a>
        <a
          href={`/api/export?sessionId=${sessionId}&format=xlsx`}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Baixar Excel
        </a>
      </div>
    </div>
  );
}
