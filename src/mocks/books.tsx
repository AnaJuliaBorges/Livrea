import type { BookTemp } from "@/features/books/types/book";
import type { ReadingInteraction } from "@/features/profile/dtos";

export const mockBooks: BookTemp[] = [
  {
    id: "book-1",
    isbn: "9788532530783",
    title_original: "Harry Potter and the Chamber of Secrets",
    title_pt: "Harry Potter e a Câmara Secreta",
    subtitle: null,
    authors: ["J.K. Rowling"],
    synopsis:
      "Harry Potter retorna para seu segundo ano em Hogwarts acreditando que finalmente terá um ano tranquilo. Porém, uma série de ataques misteriosos começa a assustar alunos e professores, enquanto uma antiga lenda sobre a Câmara Secreta volta à tona. Ao lado de Rony e Hermione, Harry precisa descobrir quem está por trás dos acontecimentos antes que mais vítimas apareçam, enfrentando criaturas perigosas, segredos do passado da escola e revelações que mudarão sua visão sobre Hogwarts.",
    publisher: "Rocco",
    publisher_date: "2017",
    total_pages: 224,

    image_thumbnail:
      "https://covers.openlibrary.org/b/isbn/9788532530783-S.jpg",
    image_medium: "https://covers.openlibrary.org/b/isbn/9788532530783-M.jpg",
    image_large: "https://covers.openlibrary.org/b/isbn/9788532530783-L.jpg",

    primary_genre: {
      id: 1,
      name: "Fantasia",
    },

    secondary_genres: ["Aventura", "Juvenil"],

    global_average_rating: 4.45,
    global_count_rating: 3800000,
    local_average_rating: 4.8,
    local_count_rating: 124,

    reviews: [
      {
        id: "review-1",
        likes: 12,
        user: {
          id: "user-1",
          name: "Ana Clara",
          photo: "https://i.pravatar.cc/150?img=1",
        },
        created_at: "2026-06-28T14:30:00Z",
        rating: 5,
        comment:
          "Uma releitura que continua tão mágica quanto da primeira vez. É impossível não se apaixonar por Hogwarts, pelos personagens e pelo início dessa jornada incrível. O livro consegue encantar leitores de todas as idades.",
      },
      {
        id: "review-2",
        user: {
          id: "user-2",
          name: "Carlos Eduardo",
          photo: "https://i.pravatar.cc/150?img=12",
        },
        created_at: "2026-06-25T20:15:00Z",
        rating: 4,
        comment:
          "Gostei bastante da construção do universo. A narrativa é leve e divertida, embora alguns acontecimentos sejam rápidos demais. Ainda assim, é um excelente começo para a série.",
        likes: 5,
      },
      {
        id: "review-3",
        user: {
          id: "user-3",
          name: "Mariana Lima",
          photo: "https://i.pravatar.cc/150?img=32",
        },
        created_at: "2026-06-20T09:40:00Z",
        rating: 5,
        comment:
          "A amizade entre Harry, Rony e Hermione é um dos pontos mais bonitos da história. Sempre volto a esse livro quando quero uma leitura confortável e cheia de nostalgia.",
        likes: 2,
      },
      {
        id: "review-4",
        user: {
          id: "user-4",
          name: "João Pedro",
          photo: "https://i.pravatar.cc/150?img=15",
        },
        created_at: "2026-06-18T18:50:00Z",
        rating: 4,
        comment:
          "Apesar de ser voltado para um público mais jovem, o livro prende do início ao fim. Os mistérios envolvendo a Pedra Filosofal deixam a leitura bastante envolvente.",
        likes: 0,
      },
      {
        id: "review-5",
        user: {
          id: "user-5",
          name: "Fernanda Souza",
          photo: "https://i.pravatar.cc/150?img=47",
        },
        created_at: "2026-06-15T11:20:00Z",
        rating: 5,
        comment:
          "Um clássico da fantasia moderna. A escrita é simples, mas extremamente cativante. Foi o livro que despertou meu amor pela leitura e continua sendo um dos meus favoritos.",
        likes: 10,
      },
    ],
  },

  {
    id: "book-2",
    isbn: "9788595086359",
    title_original: "The Hobbit",
    title_pt: "O Hobbit",
    subtitle: null,
    authors: ["J.R.R. Tolkien"],
    synopsis:
      "Bilbo Bolseiro leva uma vida tranquila até ser surpreendido pela visita do mago Gandalf e de uma companhia de treze anões. Relutante no início, ele embarca em uma jornada épica rumo à Montanha Solitária para recuperar um reino perdido e um tesouro guardado pelo temível dragão Smaug. Durante a aventura, Bilbo enfrenta trolls, aranhas gigantes, elfos e descobre um misterioso anel que mudará o destino da Terra-média.",
    publisher: "HarperCollins",
    publisher_date: "2019",
    total_pages: 336,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 1,
      name: "Fantasia",
    },

    secondary_genres: ["Aventura"],

    global_average_rating: 4.3,
    global_count_rating: 4100000,
    local_average_rating: 4.7,
    local_count_rating: 98,
  },

  {
    id: "book-3",
    isbn: "9788544106051",
    title_original: "Dune",
    title_pt: "Duna",
    subtitle: null,
    authors: ["Frank Herbert"],
    synopsis:
      "Paul Atreides, herdeiro da Casa Atreides, é levado para Arrakis, o planeta desértico conhecido como Duna, único lugar onde existe a especiaria melange, o recurso mais valioso do universo. Em meio a conspirações políticas, guerras entre grandes casas e profecias ancestrais, Paul precisará descobrir seu verdadeiro destino enquanto luta pela sobrevivência e pelo futuro de seu povo.",
    publisher: "Aleph",
    publisher_date: "2017",
    total_pages: 680,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 2,
      name: "Ficção Científica",
    },

    secondary_genres: ["Aventura", "Distopia"],

    global_average_rating: 4.28,
    global_count_rating: 1500000,
    local_average_rating: 4.6,
    local_count_rating: 67,
  },

  {
    id: "book-4",
    isbn: "9788535928181",
    title_original: "And Then There Were None",
    title_pt: "E Não Sobrou Nenhum",
    subtitle: null,
    authors: ["Agatha Christie"],
    synopsis:
      "Dez desconhecidos recebem um convite para passar alguns dias em uma ilha isolada. Sem qualquer ligação aparente entre si, eles logo descobrem que compartilham segredos obscuros do passado. Quando mortes começam a acontecer seguindo os versos de uma antiga cantiga infantil, a tensão aumenta e todos passam a desconfiar uns dos outros. Um dos maiores clássicos do mistério, com reviravoltas até a última página.",
    publisher: "HarperCollins",
    publisher_date: "2020",
    total_pages: 400,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 3,
      name: "Mistério",
    },

    secondary_genres: ["Suspense"],

    global_average_rating: 4.27,
    global_count_rating: 1200000,
    local_average_rating: 4.5,
    local_count_rating: 54,
  },

  {
    id: "book-5",
    isbn: "9788532531841",
    title_original: "Pride and Prejudice",
    title_pt: "Orgulho e Preconceito",
    subtitle: null,
    authors: ["Jane Austen"],
    synopsis:
      "Elizabeth Bennet é uma jovem inteligente e determinada que vive em uma sociedade onde o casamento define o futuro das mulheres. Ao conhecer o reservado e rico Sr. Darcy, os dois desenvolvem uma relação marcada por julgamentos precipitados, orgulho e mal-entendidos. Ao longo da história, ambos precisam confrontar seus preconceitos e amadurecer para descobrir que as primeiras impressões nem sempre revelam a verdade.",
    publisher: "Martin Claret",
    publisher_date: "2018",
    total_pages: 424,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 4,
      name: "Romance",
    },

    secondary_genres: ["Clássico"],

    global_average_rating: 4.3,
    global_count_rating: 4200000,
    local_average_rating: 4.9,
    local_count_rating: 173,
  },
  {
    id: "book-6",
    isbn: "9788578270698",
    title_original: "The Name of the Wind",
    title_pt: "O Nome do Vento",
    subtitle: null,
    authors: ["Patrick Rothfuss"],
    synopsis:
      "Kvothe narra sua vida desde a infância até se tornar uma figura lendária envolta em magia e música.",
    publisher: "Arqueiro",
    publisher_date: "2019",
    total_pages: 656,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 1,
      name: "Fantasia",
    },

    secondary_genres: ["Aventura", "Magia"],

    global_average_rating: 4.52,
    global_count_rating: 1800000,
    local_average_rating: 4.8,
    local_count_rating: 92,
  },

  {
    id: "book-7",
    isbn: "9788532523051",
    title_original: "1984",
    title_pt: "1984",
    subtitle: null,
    authors: ["George Orwell"],
    synopsis:
      "Em um regime totalitário, Winston Smith começa a questionar o sistema de vigilância constante.",
    publisher: "Companhia das Letras",
    publisher_date: "2009",
    total_pages: 416,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 5,
      name: "Distopia",
    },

    secondary_genres: ["Ficção Científica", "Política"],

    global_average_rating: 4.2,
    global_count_rating: 3900000,
    local_average_rating: 4.7,
    local_count_rating: 110,
  },

  {
    id: "book-8",
    isbn: "9788535931983",
    title_original: "The Alchemist",
    title_pt: "O Alquimista",
    subtitle: null,
    authors: ["Paulo Coelho"],
    synopsis:
      "Santiago, um pastor, parte em busca de um tesouro e descobre o verdadeiro significado de sua jornada.",
    publisher: "HarperCollins",
    publisher_date: "2014",
    total_pages: 208,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 6,
      name: "Ficção Filosófica",
    },

    secondary_genres: ["Autoajuda", "Aventura"],

    global_average_rating: 3.9,
    global_count_rating: 2500000,
    local_average_rating: 4.4,
    local_count_rating: 88,
  },

  {
    id: "book-9",
    isbn: "9788501112514",
    title_original: "The Silent Patient",
    title_pt: "A Paciente Silenciosa",
    subtitle: null,
    authors: ["Alex Michaelides"],
    synopsis:
      "Uma mulher para de falar após um crime chocante, e um terapeuta tenta descobrir a verdade.",
    publisher: "Record",
    publisher_date: "2019",
    total_pages: 364,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 3,
      name: "Mistério",
    },

    secondary_genres: ["Thriller", "Psicológico"],

    global_average_rating: 4.1,
    global_count_rating: 2100000,
    local_average_rating: 4.6,
    local_count_rating: 76,
  },

  {
    id: "book-10",
    isbn: "9788501093059",
    title_original: "The Little Prince",
    title_pt: "O Pequeno Príncipe",
    subtitle: null,
    authors: ["Antoine de Saint-Exupéry"],
    synopsis:
      "Um piloto encontra um pequeno príncipe vindo de outro planeta e aprende lições profundas sobre vida e amor.",
    publisher: "Agir",
    publisher_date: "2015",
    total_pages: 96,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 6,
      name: "Filosofia",
    },

    secondary_genres: ["Infantil", "Clássico"],

    global_average_rating: 4.6,
    global_count_rating: 9000000,
    local_average_rating: 4.9,
    local_count_rating: 210,
  },
  {
    id: "book-11",
    isbn: "9788578271237",
    title_original: "Fahrenheit 451",
    title_pt: "Fahrenheit 451",
    subtitle: null,
    authors: ["Ray Bradbury"],
    synopsis:
      "Em um futuro onde livros são proibidos, um bombeiro começa a questionar o sistema em que vive.",
    publisher: "Biblioteca Azul",
    publisher_date: "2012",
    total_pages: 208,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 5,
      name: "Distopia",
    },

    secondary_genres: ["Ficção Científica"],
  },

  {
    id: "book-12",
    isbn: "9788595084742",
    title_original: "Sapiens: A Brief History of Humankind",
    title_pt: "Sapiens: Uma Breve História da Humanidade",
    subtitle: null,
    authors: ["Yuval Noah Harari"],
    synopsis:
      "Uma jornada pela história da humanidade, desde os primeiros Homo sapiens até as sociedades modernas.",
    publisher: "Companhia das Letras",
    publisher_date: "2015",
    total_pages: 464,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 7,
      name: "Não-ficção",
    },

    secondary_genres: ["História", "Antropologia"],
  },

  {
    id: "book-13",
    isbn: "9788535914849",
    title_original: "Brave New World",
    title_pt: "Admirável Mundo Novo",
    subtitle: null,
    authors: ["Aldous Huxley"],
    synopsis:
      "Uma sociedade altamente controlada onde felicidade é fabricada artificialmente.",
    publisher: "Globo Livros",
    publisher_date: "2014",
    total_pages: 312,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 5,
      name: "Distopia",
    },

    secondary_genres: ["Ficção Científica", "Clássico"],
  },

  {
    id: "book-14",
    isbn: "9788576653721",
    title_original: "The Subtle Art of Not Giving a F*ck",
    title_pt: "A Sutil Arte de Ligar o F*da-se",
    subtitle: null,
    authors: ["Mark Manson"],
    synopsis:
      "Uma abordagem direta e irreverente sobre foco no que realmente importa na vida.",
    publisher: "Intrínseca",
    publisher_date: "2017",
    total_pages: 224,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 8,
      name: "Autoajuda",
    },

    secondary_genres: ["Psicologia", "Desenvolvimento Pessoal"],
  },

  {
    id: "book-15",
    isbn: "9788535915686",
    title_original: "The Catcher in the Rye",
    title_pt: "O Apanhador no Campo de Centeio",
    subtitle: null,
    authors: ["J.D. Salinger"],
    synopsis:
      "Holden Caulfield narra sua jornada emocional por Nova York após ser expulso da escola.",
    publisher: "Todavia",
    publisher_date: "2019",
    total_pages: 240,

    image_thumbnail: null,
    image_medium: null,
    image_large: null,

    primary_genre: {
      id: 4,
      name: "Romance",
    },

    secondary_genres: ["Clássico", "Drama"],
  },
];

export const mockReadingInteraction: ReadingInteraction = {
  user_id: "user-1",
  book_id: "book-1", // Harry Potter e a Câmara Secreta
  total_pages: 224,
  last_progress: 224,

  reading_logs: [
    {
      pages_read: 32,
      feeling: "gostei",
      created_at: "2026-06-02T20:15:00",
    },
    {
      pages_read: 74,
      feeling: "amei",
      created_at: "2026-06-04T22:10:00",
    },
    {
      pages_read: 128,
      feeling: "okay",
      created_at: "2026-06-06T19:45:00",
    },
    {
      pages_read: 176,
      feeling: "gostei",
      created_at: "2026-06-08T21:00:00",
    },
    {
      pages_read: 224,
      feeling: "amei",
      created_at: "2026-06-10T23:15:00",
    },
  ],

  highlights: [
    {
      quote:
        "São as nossas escolhas que revelam o que realmente somos, muito mais do que as nossas qualidades.",
      page: 87,
      percentage: 39,
    },
    {
      quote:
        "Nunca confie em algo que possa pensar por si mesmo se você não consegue ver onde guarda o cérebro.",
      page: 152,
      percentage: 68,
    },
    {
      quote: "O medo de um nome aumenta o medo da própria coisa.",
      page: 210,
      percentage: 94,
    },
  ],

  review: {
    rating: 5,
    review:
      "Uma releitura que continua incrível. A construção do mistério é excelente, o desenvolvimento dos personagens é muito melhor do que no primeiro livro e o final continua sendo extremamente satisfatório. O diário de Tom Riddle foi um dos elementos que mais gostei.",
  },
};
