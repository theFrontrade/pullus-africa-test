"use client";

interface NotesSummaryProps {
  total: number;
  pending: number;
  synced: number;
}

export default function NotesSummary({
  total,
  pending,
  synced,
}: NotesSummaryProps) {
  const cards = [
    {
      label: "Total Notes",
      value: total,
      color: "bg-blue-50 ",
      borderColor: "border-blue-200 ",
      textColor: "text-blue-600 ",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2H4a1 1 0 110-2V4zm3 1h6v2H7V5zm0 4h6v2H7V9zm0 4h6v2H7v-2z" />
        </svg>
      ),
    },

    {
      label: "Synced Notes",
      value: synced,
      color: "bg-green-50 ",
      borderColor: "border-green-200 ",
      textColor: "text-green-600 ",
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      label: "Pending Sync",
      value: pending,
      color: "bg-amber-50 ",
      borderColor: "border-gray-200 ",
      textColor: "text-gray-600 text-gray-400",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`p-4 rounded-lg border   border-gray-200 transition-shadow`}
        >
          <div
            className={`flex items-center justify-between flex-row-reverse gap-3 mb-3 ${card.textColor}`}
          >
            {card.icon}
            <p className="text-sm font-semibold">{card.label}</p>
          </div>
          <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
