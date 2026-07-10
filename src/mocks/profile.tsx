import type { UserProfile } from "@/features/profile/dtos";

export const mockProfile: UserProfile = {
  id: "user-1",

  name: "Ana Júlia Borges",
  username: "@anajborges",

  photo: "https://i.pravatar.cc/300?img=32",

  city: "Recife",
  state: "PE",

  bio: "Apaixonada por fantasia, ficção científica e um bom mistério. Sempre em busca da próxima leitura que vai me prender madrugada adentro. 📚✨",

  friends: [
    {
      id: "user-2",
      name: "Marina Alves",
      username: "@marinaalves",
      photo: "https://i.pravatar.cc/300?img=45",
    },
    {
      id: "user-3",
      name: "Lucas Martins",
      username: "@lucasm",
      photo: "https://i.pravatar.cc/300?img=12",
    },
    {
      id: "user-4",
      name: "Beatriz Costa",
      username: "@bia.costa",
      photo: "https://i.pravatar.cc/300?img=23",
    },
    {
      id: "user-5",
      name: "João Pedro",
      username: "@jpreads",
      photo: "https://i.pravatar.cc/300?img=18",
    },
  ],

  clubs: [
    {
      id: "1", // myClubs[0]
      name: "Fantasia Sem Fronteiras",
      city: "Rio de Janeiro",
      state: "RJ",
      genres: ["Fantasia", "Aventura"],
      isAdmin: true,
      participants: 87,
      participantLimit: 100,
    },
    {
      id: "2", // myClubs[1]
      name: "Mistérios à Meia-Noite",
      city: "São Paulo",
      state: "SP",
      genres: ["Mistério", "Suspense"],
      isAdmin: false,
      participants: 42,
      participantLimit: 50,
    },
    {
      id: "3", // myClubs[2]
      name: "Entre Páginas e Corações",
      city: "Belo Horizonte",
      state: "MG",
      genres: ["Romance"],
      isAdmin: false,
      participants: 124,
      participantLimit: null,
    },
  ],

  library: {
    read: [
      {
        id: "book-5",
        title: "Orgulho e Preconceito",
        overallRating: 4.3,
        image: {
          smallThumbnail: undefined,
          thumbnail: undefined,
          medium: undefined,
          large: undefined,
        },
      },
      {
        id: "book-6",
        title: "1984",
        overallRating: 4.19,
        image: {
          smallThumbnail: undefined,
          thumbnail: undefined,
          medium: undefined,
          large: undefined,
        },
      },
    ],

    reading: [
      {
        id: "book-1",
        title: "Harry Potter e a Câmara Secreta",
        overallRating: 4.45,
        image: {
          smallThumbnail: undefined,
          thumbnail: undefined,
          medium: undefined,
          large: undefined,
        },
      },
    ],

    wantToRead: [
      {
        id: "book-2",
        title: "O Hobbit",
        overallRating: 4.3,
        image: {
          smallThumbnail: undefined,
          thumbnail: undefined,
          medium: undefined,
          large: undefined,
        },
      },
      {
        id: "book-3",
        title: "Duna",
        overallRating: 4.28,
        image: {
          smallThumbnail: undefined,
          thumbnail: undefined,
          medium: undefined,
          large: undefined,
        },
      },
      {
        id: "book-4",
        title: "E Não Sobrou Nenhum",
        overallRating: 4.27,
        image: {
          smallThumbnail: undefined,
          thumbnail: undefined,
          medium: undefined,
          large: undefined,
        },
      },
    ],
  },
};
