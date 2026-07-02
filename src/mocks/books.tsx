import type { BookTemp } from "@/features/books/types/book";

export const mockBooks: BookTemp[] = [
  {
    id: "book-1",
    isbn: "9788532530783",
    title_original: "Harry Potter and the Chamber of Secrets",
    title_pt: "Harry Potter e a Câmara Secreta",
    subtitle: null,
    authors: ["J.K. Rowling"],
    synopsis:
      "No segundo ano em Hogwarts, Harry precisa desvendar o mistério da Câmara Secreta antes que novos ataques aconteçam.",
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
  },

  {
    id: "book-2",
    isbn: "9788595086359",
    title_original: "The Hobbit",
    title_pt: "O Hobbit",
    subtitle: null,
    authors: ["J.R.R. Tolkien"],
    synopsis:
      "Bilbo Bolseiro embarca em uma jornada inesperada para recuperar um tesouro guardado por um dragão.",
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
      "Em Arrakis, o jovem Paul Atreides se vê no centro de uma disputa pelo recurso mais valioso do universo.",
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
      "Dez pessoas são convidadas para uma ilha isolada e passam a ser assassinadas uma a uma.",
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
      "A clássica história de Elizabeth Bennet e Mr. Darcy, marcada por orgulho, preconceitos e descobertas.",
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
