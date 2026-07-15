import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "transparent",
          "--success-bg": "var(--color-success-light)",
          "--success-text": "var(--color-success)",
          "--success-border": "transparent",
          "--error-bg": "var(--color-destructive-light)",
          "--error-text": "var(--color-destructive)",
          "--error-border": "transparent",
          "--warning-bg": "var(--color-warning-light)",
          "--warning-text": "var(--color-warning)",
          "--warning-border": "transparent",
          "--info-bg": "var(--color-info-light)",
          "--info-text": "var(--color-info)",
          "--info-border": "transparent",
          "--border-radius": "8px",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
