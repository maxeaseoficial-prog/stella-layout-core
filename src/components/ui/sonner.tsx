import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-left"
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-primary group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-primary-foreground/80",
          title: "group-[.toast]:font-semibold",
          icon: "group-[.toast]:text-primary-foreground",
          actionButton: "group-[.toast]:bg-primary-foreground group-[.toast]:text-primary",
          cancelButton: "group-[.toast]:bg-primary-foreground/20 group-[.toast]:text-primary-foreground",
          closeButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:border-primary-foreground/40",
          error:
            "group-[.toaster]:!border-destructive group-[.toaster]:!bg-destructive group-[.toaster]:!text-destructive-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
