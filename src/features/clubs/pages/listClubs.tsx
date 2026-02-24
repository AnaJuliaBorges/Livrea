import { useListarClubes } from "../hooks/useListClubs";

export default function ListClubs() {
  const { data: clubes, isLoading, error } = useListarClubes();

  if (isLoading) {
    return <div className="text-center py-8">Carregando clubes...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ Erro ao carregar clubes</p>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clubes.map((clube: any) => (
        <div key={clube.id} className="bg-white rounded-lg shadow p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{clube.nome}</h2>
              <p className="text-gray-600">{clube.descricao}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                clube.privacidade
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {clube.privacidade ? "🔒 Privado" : "🔓 Público"}
            </span>
          </div>

          {/* Localização */}
          {clube.cidade_nome && clube.estado_sigla && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              📍{clube.cidade_nome}, {clube.estado_sigla}
            </div>
          )}

          {/* Leitura Atual */}
          {clube.leitura_atual && (
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">📚 Leitura Atual</p>
              <p className="font-bold text-gray-900">
                {clube.leitura_atual.livro.titulo}
              </p>
              <p className="text-sm text-gray-600">
                {clube.leitura_atual.livro.autores.join(", ")}
              </p>
              {clube.leitura_atual.livro.capa_url && (
                <img
                  src={clube.leitura_atual.livro.capa_url}
                  alt={clube.leitura_atual.livro.titulo}
                  className="w-16 h-24 object-cover rounded mt-2"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
          )}

          {/* Gêneros */}
          {clube.generos && clube.generos.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Gêneros
              </p>
              <div className="flex flex-wrap gap-2">
                {clube.generos.map((genero) => (
                  <span
                    key={genero.id}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
                  >
                    {genero.nome}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Informações */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-500 uppercase">Participantes</p>
              <p className="text-lg font-bold">
                {clube.total_participantes}
                {clube.limite_participantes && (
                  <span className="text-sm text-gray-500">
                    /{clube.limite_participantes}
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Tipo</p>
              <p className="text-lg font-bold capitalize">{clube.tipo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Frequência</p>
              <p className="text-lg font-bold capitalize">
                {clube.frequencia || "-"}
              </p>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="mt-4">
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
              {clube.privacidade ? "Pedir Acesso" : "Participar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
