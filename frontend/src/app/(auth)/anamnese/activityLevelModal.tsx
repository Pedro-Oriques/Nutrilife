export default function ActivityLevelModal({ formData, setFormData }: any) {
  const OPTIONS = [
    {
      label: "Sedentário",
      desc: "pouco ou nenhum exercício físico,trabalho sentado",
      value: "Sedentário",
      emoji: "🚫",
    },
    {
      label: "Pouco ativo",
      desc: "exercício físico 1 a 3 dias por semana",
      value: "Pouco ativo",
      emoji: "🚶",
    },
    {
      label: "Ativo",
      desc: "exercício físico 3 a 5 dias por semana",
      value: "Ativo",
      emoji: "🏃",
    },
    {
      label: "Muito Ativo",
      desc: "exercício físico 6 a 7 dias por semana",
      value: "Muito Ativo",
      emoji: "🚴",
    },
    {
      label: "Extremamente Ativo",
      desc: "exercício físico 2x por dia",
      value: "Extremamente Ativo",
      emoji: "💪",
    },
  ];

  return (
    <div className="w-full max-w-[540px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <div className="w-10 h-2 bg-orange-400 rounded-full"></div>
          <div className="w-10 h-2 bg-orange-400 rounded-full"></div>
          <div className="w-10 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-10 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-10 h-2 bg-gray-200 rounded-full"></div>
        </div>
        <span className="text-sm text-gray-500 font-medium">2/5</span>
      </div>

      <div className="mb-4">
        <h1 className="text-3xl font-extrabold text-secondary-700 leading-tight">
          Queremos saber mais <br /> sobre você ✨
        </h1>
        <p className="text-gray-600 mt-1 text-sm font-medium">
          Qual é o seu nível de atividade física?
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full">
        {OPTIONS.map((item) => {
          const isSelected = formData.physicalActivity === item.value;

          return (
            <button
              key={item.value}
              onClick={() =>
                setFormData((prev: any) => ({
                  ...prev,
                  physicalActivity: item.value,
                }))
              }
              className={`w-full min-h-[60px] px-4 py-2 rounded-xl border-2 flex items-center justify-between transition-all duration-200 text-left cursor-pointer
                ${
                  isSelected
                    ? "bg-secondary-400 border-secondary-400 shadow-md"
                    : "bg-white border-secondary-400 hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-colors shrink-0
                    ${isSelected ? "bg-white/20" : "bg-gray-100"}`}
                >
                  {item.emoji}
                </div>

                <div className="flex flex-col">
                  <span
                    className={`font-bold text-base leading-tight ${
                      isSelected ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`text-xs mt-0.5 ${
                      isSelected ? "text-white/90" : "text-gray-500"
                    }`}
                  >
                    {item.desc}
                  </span>
                </div>
              </div>

              {isSelected && (
                <svg
                  className="w-5 h-5 text-white shrink-0 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
