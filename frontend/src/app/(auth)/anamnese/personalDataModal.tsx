export default function PersonalDataModal({ formData, handleChange, fieldErrors }: any) {
  return (
    <div className="w-full max-w-[540px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <div className="w-10 h-2 bg-orange-400 rounded-full"></div>
          <div className="w-10 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-10 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-10 h-2 bg-gray-200 rounded-full"></div>
          <div className="w-10 h-2 bg-gray-200 rounded-full"></div>
        </div>
        <span className="text-sm text-gray-500 font-medium">1/5</span>
      </div>

      <div className="mb-4">
        <h1 className="text-3xl font-extrabold text-secondary-700 leading-tight">
          Queremos saber mais <br /> sobre você ✨
        </h1>
        <p className="text-gray-500 mt-1 text-sm font-medium">
          Suas informações básicas:
        </p>
      </div>

      <div className="space-y-3 w-full">
        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">
            Data de nascimento:
          </label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className={`w-full h-10 px-4 rounded-xl border-2 bg-gray-50 focus:bg-white outline-none transition-all ${
              fieldErrors?.birthDate
                ? "border-red-400 focus:border-red-400"
                : "border-gray-200 focus:border-secondary-400"
            }`}
          />
          {fieldErrors?.birthDate && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.birthDate}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">
            Altura:
          </label>
          <div className="relative">
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              placeholder="175"
              className={`w-full h-10 px-4 rounded-xl border-2 bg-gray-50 focus:bg-white outline-none transition-all ${
                fieldErrors?.height
                  ? "border-red-400 focus:border-red-400"
                  : "border-gray-200 focus:border-secondary-400"
              }`}
            />
            <span className="absolute right-4 top-2.5 text-gray-400 text-sm font-medium">
              cm
            </span>
          </div>
          {fieldErrors?.height && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.height}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">
            Peso:
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="65,3"
              className={`w-full h-10 px-4 rounded-xl border-2 bg-gray-50 focus:bg-white outline-none transition-all ${
                fieldErrors?.weight
                  ? "border-red-400 focus:border-red-400"
                  : "border-gray-200 focus:border-secondary-400"
              }`}
            />
            <span className="absolute right-4 top-2.5 text-gray-400 text-sm font-medium">
              kg
            </span>
          </div>
          {fieldErrors?.weight && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.weight}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-semibold text-gray-700 mb-1">
            Sexo:
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`w-full h-10 px-4 rounded-xl border-2 bg-gray-50 focus:bg-white outline-none transition-all appearance-none ${
              fieldErrors?.gender
                ? "border-red-400 focus:border-red-400"
                : "border-gray-200 focus:border-secondary-400"
            }`}
          >
            <option value="">Selecione</option>
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
          </select>
          {fieldErrors?.gender && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.gender}</p>
          )}
        </div>
      </div>
    </div>
  );
}
