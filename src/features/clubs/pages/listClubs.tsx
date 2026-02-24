import type { Club } from "../dtos";
import { useListClubs } from "../hooks/useListClubs";

export default function ListClubs() {
  const { data: clubs, isLoading, error } = useListClubs();

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

  if (clubs && clubs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ Nenhum clube encontrado</p>
          <p className="text-gray-600">
            Tente ajustar os filtros ou criar um novo clube.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 grid grid-cols-2 gap-4">
      {clubs?.map((club: Club) => (
        <div
          key={club.id}
          className="bg-white rounded-lg shadow p-6 flex flex-col justify-between"
        >
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {club.nome}
                </h2>
                <p className="text-gray-600">{club.descricao}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                  club.privacidade
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {club.privacidade ? "🔒 Privado" : "🔓 Público"}
              </span>
            </div>

            {/* Localização */}
            {club.cidade_nome && club.estado_sigla && (
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                📍{club.cidade_nome}, {club.estado_sigla}
              </div>
            )}

            <div className="flex gap-2 items-center mb-4">
              <div>
                {club.leitura_atual?.livro.capa_url && (
                  <img
                    src={club.leitura_atual.livro.capa_url}
                    alt={club.leitura_atual.livro.titulo}
                    className="w-16 h-24 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
              <div className="flex-1">
                {club.leitura_atual && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      📚 Leitura Atual
                    </p>
                    <p className="font-bold text-gray-900">
                      {club.leitura_atual.livro.titulo}
                    </p>
                    <p className="text-sm text-gray-600">
                      {club.leitura_atual.livro.autores.join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Gêneros */}
            {club.generos && club.generos.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Gêneros
                </p>
                <div className="flex flex-wrap gap-2">
                  {club.generos.map((genero) => (
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
                  {club.total_participantes}
                  {club.limite_participantes && (
                    <span className="text-sm text-gray-500">
                      /{club.limite_participantes}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Tipo</p>
                <p className="text-lg font-bold capitalize">{club.tipo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Frequência</p>
                <p className="text-lg font-bold capitalize">
                  {club.frequencia || "-"}
                </p>
              </div>
            </div>
          </div>
          {/* Botão de Ação */}
          <div className="mt-4  self-end">
            <button className=" px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium">
              {club.privacidade ? "Pedir Acesso" : "Participar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
