import { useEffect, useMemo, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button, FieldDescription } from "@/components/ui";
import { UserAvatar } from "./UserAvatar";
import { ALLOWED_IMAGE_MESSAGE, isAllowedImage } from "@/lib/imageUpload";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

// Seletor de foto de perfil (preview + validação de tipo/tamanho) usado no
// cadastro (email e Google) e na edição de perfil. O File escolhido fica com
// o pai (`value`/`onChange`) — só ele sabe a hora de fazer o upload.
export function AvatarPicker({
  name,
  currentUrl,
  value,
  onChange,
  label,
  className = "h-28 w-28",
  fallbackClassName = "bg-gray-300",
}: {
  name: string;
  currentUrl?: string | null;
  value: File | null;
  onChange: (file: File) => void;
  label: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(
    () => (value ? URL.createObjectURL(value) : undefined),
    [value],
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAllowedImage(file)) {
      setError(ALLOWED_IMAGE_MESSAGE);
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError("A imagem deve ter no máximo 5MB");
      return;
    }

    setError(null);
    onChange(file);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <UserAvatar
        name={name}
        src={preview ?? currentUrl}
        className={className}
        fallbackClassName={fallbackClassName}
        fallback={<Camera className="h-8 w-8 text-gray-500" />}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      <Button
        type="button"
        variant="link"
        onClick={() => fileInputRef.current?.click()}
      >
        <Camera />
        {label}
      </Button>

      {error && (
        <FieldDescription className="text-red-500">{error}</FieldDescription>
      )}
    </div>
  );
}
