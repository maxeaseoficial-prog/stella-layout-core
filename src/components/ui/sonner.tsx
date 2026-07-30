import type { CSSProperties } from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-left"
      closeButton
      toastOptions={{
        style: {
          "--normal-bg": "var(--primary)",
          "--normal-text": "var(--primary-foreground)",
          "--normal-border": "var(--primary)",
        } as CSSProperties,
        classNames: {
          toast: "group toast group-[.toaster]:shadow-lg",
          description: "group-[.toast]:!text-primary-foreground/80",
          icon: "group-[.toast]:!text-primary-foreground",
          actionButton: "group-[.toast]:!bg-primary-foreground group-[.toast]:!text-primary",
          cancelButton:
            "group-[.toast]:!bg-primary-foreground/20 group-[.toast]:!text-primary-foreground",
          closeButton:
            "group-[.toast]:!bg-primary group-[.toast]:!text-primary-foreground group-[.toast]:!border-primary-foreground/40",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
