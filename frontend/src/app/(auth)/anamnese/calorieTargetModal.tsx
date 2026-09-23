"use client";

type CalorieTargetModalProps = {
  metrics: {
    dailyCalories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
  };
  goal: string;
  onFinish?: () => void;
  isLoading?: boolean;
};

const MacroDonut = ({ goal }: { goal: string }) => {
  let fatScale = 0.75;
  let protScale = 0.75;
  let carbScale = 0.75;

  if (goal === "Perda de peso") {
    carbScale = 0.7;
    protScale = 0.8;
  } else if (goal === "Ganho de massa") {
    fatScale = 0.7;
    protScale = 0.8;
  }

  const absoluteCenter = "144.5px 151.5px";

  return (
    <div
      style={{ width: "288.69px", height: "302.27px" }}
      className="relative flex items-center justify-center drop-shadow-sm"
    >
      <svg
        width="289"
        height="303"
        viewBox="0 0 289 303"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Fundo: Círculo verde com preenchimento claro */}
        <circle
          cx="144.5"
          cy="151.5"
          r="138"
          fill="#F4F8F6"
          stroke="#00674F"
          strokeWidth="6"
        />

        {/* Proteína (Marrom Escuro) */}
        <path
          d="M168.143 156.977C144.577 112.323 122.622 175.518 96.941 188.94C66.5361 204.831 27.0498 160.417 25.9787 223.226C25.2453 266.233 104.548 297.568 126.075 294.511C169.794 288.302 204.312 225.512 168.143 156.977Z"
          fill="#290904"
          style={{
            transform: `scale(${protScale})`,
            transformOrigin: absoluteCenter,
            transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Carboidratos (Verde Escuro) */}
        <path
          d="M199.174 224.202C208.428 146.986 165.001 121.388 120.312 86.7658C75.6217 52.1441 137.661 -17.0987 190.762 3.88472C333.766 60.3934 283.294 205.842 264.892 233.12C248.537 257.365 187.608 320.722 199.174 224.202Z"
          fill="#00674F"
          style={{
            transform: `scale(${carbScale})`,
            transformOrigin: absoluteCenter,
            transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Gordura (Laranja/Vermelho) */}
        <path
          d="M29.5176 40.9176C54.9877 -0.193318 78.5666 5.66525 82.7497 11.0977C89.2979 19.6017 93.3787 30.008 80.6115 62.8524C64.6526 103.908 88.2138 100.604 101.598 126.666C114.982 152.729 75.8072 194.728 36.9739 160.123C-1.85935 125.518 6.26057 78.4565 29.5176 40.9176Z"
          fill="#C94A31"
          style={{
            transform: `scale(${fatScale})`,
            transformOrigin: absoluteCenter,
            transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
    </div>
  );
};

export default function CalorieTargetModal({
  metrics,
  goal,
  onFinish,
  isLoading,
}: CalorieTargetModalProps) {
  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <div className="w-10 h-2 bg-orange-400 rounded-full"></div>
          <div className="w-10 h-2 bg-orange-400 rounded-full"></div>
          <div className="w-10 h-2 bg-orange-400 rounded-full"></div>
          <div className="w-10 h-2 bg-orange-400 rounded-full"></div>
          <div className="w-10 h-2 bg-orange-400 rounded-full"></div>
        </div>
        <span className="text-sm text-gray-500 font-medium">5/5</span>
      </div>

      {/* Header: Título + "Vamos começar?" */}
      <div className="flex flex-row items-start justify-between mb-20 gap-16">
        <div className="flex-1">
          <h1
            className="text-5xl font-black mb-6 leading-tight"
            style={{ color: "#1a1a1a" }}
          >
            Meta Calórica Diária
          </h1>
          <p
            className="text-sm leading-relaxed max-w-lg"
            style={{ color: "#666" }}
          >
            Os valores de <strong>carboidratos, proteínas e gorduras</strong>{" "}
            apresentados são sugestões baseadas em recomendações nutricionais
            gerais para auxiliar na distribuição equilibrada de macronutrientes
            ao longo do dia.
          </p>
        </div>

        <div className="text-right flex-shrink-0 pt-1">
          <p className="text-lg font-medium mb-3" style={{ color: "#1a1a1a" }}>
            Vamos começar?
          </p>
          <button
            onClick={onFinish}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: "#C94A31" }}
          >
            {isLoading ? "Salvando..." : "Concluir formulário"}
            {!isLoading && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Macros + Donut */}
      <div className="flex items-center justify-between gap-16 mb-20">
        {/* Left macro - Gorduras + Proteínas */}
        <div className="text-right flex-1 flex flex-col gap-12">
          <div>
            <p className="text-7xl font-black" style={{ color: "#C94A31" }}>
              {metrics.fats}g
            </p>
            <p
              className="text-2xl font-medium mt-3"
              style={{ color: "#C94A31" }}
            >
              Gorduras
            </p>
          </div>
          <div>
            <p className="text-7xl font-black" style={{ color: "#290904" }}>
              {metrics.proteins}g
            </p>
            <p
              className="text-2xl font-medium mt-3"
              style={{ color: "#290904" }}
            >
              Proteínas
            </p>
          </div>
        </div>

        {/* Center: Gráfico Dinâmico */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <MacroDonut goal={goal} />
        </div>

        {/* Right macro - Carboidratos */}
        <div className="text-left flex-1">
          <p className="text-7xl font-black" style={{ color: "#00674F" }}>
            {metrics.carbohydrates}g
          </p>
          <p className="text-2xl font-medium mt-3" style={{ color: "#00674F" }}>
            Carboidratos
          </p>
        </div>
      </div>

      {/* Bottom: note + total */}
      <div className="w-full flex items-end mt-20 pt-10">
        <p className="text-sm italic max-w-sm" style={{ color: "#666" }}>
          Você poderá alterar a meta calórica e a distribuição de
          <br />
          macronutrientes posteriormente nas configurações do perfil.
        </p>

        <div className="text-right ml-auto">
          <p className="text-4xl font-black" style={{ color: "#1a1a1a" }}>
            Total
          </p>
          <p className="text-4xl font-bold" style={{ color: "#1a1a1a" }}>
            {metrics.dailyCalories}kcal/dia
          </p>
        </div>
      </div>
    </div>
  );
}
