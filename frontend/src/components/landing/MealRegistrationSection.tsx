import { FiShoppingBag } from "react-icons/fi";
import { MdOutlineFoodBank } from "react-icons/md";

export default function MealRegistrationSection() {
  return (
    <section className="py-16 md:py-28 px-5 md:px-12 bg-[#f0faf7]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <p className="text-secondary-200 text-sm font-semibold uppercase tracking-widest mb-3">
            Registro de refeições
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
            Mais rapidez e praticidade no dia a dia
          </h2>
          <p className="text-gray-500 text-base md:text-lg mt-4">
            Registre o que você come de duas formas simples e rápidas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col gap-4">
            <div className="bg-secondary-200/10 text-secondary-300 w-12 h-12 rounded-xl flex items-center justify-center">
              <FiShoppingBag size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Alimento individual</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Adicione alimentos unitários com informações nutricionais detalhadas.
              Ideal para lanches rápidos ou quando você quer precisão total.
            </p>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 mt-auto">
              <span className="text-sm text-gray-700">Banana prata</span>
              <span className="text-sm text-gray-500">89 kcal</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-secondary-200 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col gap-4">
            <div className="bg-white/20 text-white w-12 h-12 rounded-xl flex items-center justify-center">
              <MdOutlineFoodBank size={26} />
            </div>
            <h3 className="text-xl font-bold text-white">Prato completo</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Monte combinações prontas com seus alimentos favoritos. Salve e
              reutilize para agilizar seu registro diário.
            </p>
            <div className="flex items-center gap-2 bg-white/15 rounded-lg px-4 py-3 mt-auto">
              <span className="text-secondary-200 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">✦</span>
              <div>
                <p className="text-white text-sm font-medium">Arroz + feijão + frango</p>
                <p className="text-white/70 text-xs">412 kcal • Salvo como favorito</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
