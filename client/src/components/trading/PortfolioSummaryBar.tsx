interface Holding {
  currentValue: number;
  profitLoss: number;
}

interface PortfolioSummaryBarProps {
  cash: number;
  holdings: Holding[];
  startingBalance: number;
}

export function PortfolioSummaryBar({ cash, holdings, startingBalance }: PortfolioSummaryBarProps) {
  const invested = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const totalPL = holdings.reduce((sum, h) => sum + (h.profitLoss || 0), 0);
  const totalValue = cash + invested;
  const pctChange = startingBalance > 0
    ? ((totalValue - startingBalance) / startingBalance) * 100
    : 0;

  const formatMoney = (val: number) => {
    const abs = Math.abs(val);
    return (val < 0 ? "-" : "") + "$" + abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const stats = [
    { label: "Cash", value: formatMoney(cash), color: "#F1F5F9" },
    { label: "Invested", value: formatMoney(invested), color: "#F1F5F9" },
    {
      label: "% Change",
      value: (pctChange >= 0 ? "+" : "") + pctChange.toFixed(2) + "%",
      color: pctChange >= 0 ? "#10B981" : "#EF4444",
    },
    {
      label: "P/L",
      value: (totalPL >= 0 ? "+" : "") + formatMoney(totalPL),
      color: totalPL >= 0 ? "#10B981" : "#EF4444",
    },
  ];

  return (
    <div
      className="grid grid-cols-4 divide-x px-4 py-3"
      style={{ borderBottom: "1px solid #1F2937", divideColor: "#1F2937" } as React.CSSProperties}
    >
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center px-2">
          <span className="text-[10px] uppercase tracking-wide" style={{ color: "#64748B" }}>
            {s.label}
          </span>
          <span className="text-sm font-bold mt-0.5" style={{ color: s.color }}>
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}
