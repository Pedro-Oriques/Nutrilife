import { FiAlertTriangle } from "react-icons/fi";
import { MdOutlineCancel, MdOutlineCheckCircle } from "react-icons/md";

const restrictions = [
  { name: "Glúten", restricted: true },
  { name: "Lactose", restricted: true },
  { name: "Amendoim", restricted: true },
  { name: "Frango", restricted: false },
  { name: "Arroz integral", restricted: false },
  { name: "Brócolis", restricted: false },
];

export default function RestrictionsSection() {
  return (
    <section className="py-20 px-8 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
        {/* Left - restriction list card */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 w-full max-w-sm">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
              Restrições configuradas
            </p>
            <ul className="flex flex-col gap-2">
              {restrictions.map((r) => (
                <li
                  key={r.name}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    {r.restricted ? (
                      <MdOutlineCancel className="text-red-400" size={18} />
                    ) : (
                      <MdOutlineCheckCircle
                        className="text-secondary-200"
                        size={18}
                      />
                    )}
                    <span className="text-sm text-gray-700">{r.name}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold ${r.restricted ? "text-red-400" : "text-secondary-200"}`}
                  >
                    {r.restricted ? "Restrito" : "Liberado"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right */}
        <div className="flex-1 flex flex-col gap-6">
          <p className="text-secondary-200 text-sm font-semibold uppercase tracking-widest">
            Restrições alimentares
          </p>
          <h2 className="text-4xl font-bold text-gray-900 leading-tight">
            Mais segurança e praticidade no seu dia a dia
          </h2>
          <p className="text-gray-500 leading-relaxed">
            Cadastre suas restrições alimentares e o NutriLife garante que
            alimentos restritos não apareçam nas sugestões ao registrar
            refeições.
          </p>
          <div className="flex items-start gap-3 bg-[#f0faf7] border border-secondary-200/20 rounded-xl p-4">
            <FiAlertTriangle
              className="text-secondary-200 mt-0.5 shrink-0"
              size={18}
            />
            <p className="text-sm text-gray-600">
              Alimentos incompatíveis com seu perfil são automaticamente
              filtrados, evitando erros no registro.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
