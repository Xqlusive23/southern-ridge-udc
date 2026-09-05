"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FormButton({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "destructive";
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
      className={cn("h-10 px-4", className)}
    >
      {pending ? "Saving…" : children}
    </Button>
  );
}
