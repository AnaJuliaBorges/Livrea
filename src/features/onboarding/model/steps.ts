import {
  Bell,
  BookOpen,
  MessageCircleMore,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface WelcomeTourStep {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
}

export const welcomeTourSteps: WelcomeTourStep[] = [
  {
    id: "welcome",
    icon: Sparkles,
    title: "Boas-vindas ao Livrea",
    description:
      "O Livrea junta o que você lê com quem lê junto: clubes de leitura, acompanhamento das suas leituras e conversa sobre os livros.",
    bullets: [
      "Leva menos de um minuto pra ver tudo",
      "Você pode fechar agora e voltar quando quiser",
    ],
  },
  {
    id: "clubs",
    icon: Users,
    title: "Clubes de leitura",
    description:
      "Em Home você encontra clubes perto de você, online ou recomendados pelos seus gêneros favoritos.",
    bullets: [
      "Peça pra entrar num clube e aguarde o aceite do admin",
      "Crie o seu clube e defina se ele é público ou privado",
      "Marque encontros e confirme presença",
    ],
  },
  {
    id: "reading",
    icon: MessageCircleMore,
    title: "Leitura em grupo e chat",
    description:
      "Cada clube tem uma leitura atual, com os leitores, as resenhas e os destaques de todo mundo num lugar só.",
    bullets: [
      "Converse no chat exclusivo dos participantes",
      "Marque a mensagem como spoiler: ela chega borrada e só aparece pra quem já passou daquele ponto do livro",
      "Veja a nota do clube para o livro",
    ],
  },
  {
    id: "books",
    icon: BookOpen,
    title: "Seus livros",
    description:
      "Em Livros você busca qualquer título e organiza sua biblioteca entre lido, lendo e quero ler.",
    bullets: [
      "Registre o progresso com anotação e sentimento",
      "Guarde destaques (trechos) do que está lendo",
      "Escreva sua resenha e dê nota",
    ],
  },
  {
    id: "social",
    icon: Bell,
    title: "Perfil, gente e avisos",
    description:
      "Seu perfil mostra seus clubes e sua biblioteca. Dá pra seguir outros leitores e personalizar a cor do cabeçalho.",
    bullets: [
      "Notificações avisam sobre pedidos, mensagens e novos seguidores",
      "Instale o Livrea na tela de início pra receber notificações no celular",
      "Achou algo estranho? Conta pra gente — é isso que estamos testando",
    ],
  },
];
