export const formatDate = (date: Date) => {
  return date.toLocaleDateString("pt-BR");
};

export const formatDateString = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR");
};

// publisher_date vem das APIs em formatos variados ("2018-04-26",
// "2018", "April 2018") — extrai só o ano
export const extractYear = (date: string) => {
  return date.match(/\d{4}/)?.[0] ?? date;
};
