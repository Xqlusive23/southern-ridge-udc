import { cn } from "@/lib/utils";

export function MemberPhoto({
  photoPath,
  initials,
  alt,
  className,
}: {
  photoPath?: string | null;
  initials: string;
  alt: string;
  className?: string;
}) {
  if (photoPath) {
    return (
      // Uploaded member photos live under /uploads and change after replace.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoPath}
        alt={alt}
        className={cn("size-full object-cover", className)}
      />
    );
  }
  return (
    <span className={cn("grid size-full place-items-center", className)}>
      {initials}
    </span>
  );
}
