export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const ALLOWED_IMAGE_MESSAGE =
  "Formato de imagem não suportado — use JPG, PNG ou WebP";

export function isAllowedImage(file: File): boolean {
  return file.type in ALLOWED_IMAGE_TYPES;
}

export function imageExtension(file: File): string {
  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) throw new Error(ALLOWED_IMAGE_MESSAGE);
  return extension;
}
