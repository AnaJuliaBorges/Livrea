import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/GoogleIcon";

export function GoogleButton({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={onClick}
      disabled={disabled}
    >
      <GoogleIcon />
      {label}
    </Button>
  );
}
