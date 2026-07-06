export const formatDate = (date: Date) => {
  return date.toLocaleDateString("pt-BR");
};

export const formatDateString = (date: string) => {
  return new Date(date).toLocaleDateString("pt-BR");
};
