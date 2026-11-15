import { ImagePlus, X } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { fileToResizedDataUrl } from "@/lib/image-resize";

export const MAX_PHOTOS = 5;

interface PhotoUploaderProps {
  id?: string;
  /** Photos as data URLs. The first one is the cover. */
  photos: string[];
  onChange: (photos: string[]) => void;
}

export function PhotoUploader({ id, photos, onChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const remaining = MAX_PHOTOS - photos.length;

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow picking the same file again after removing it
    if (files.length === 0) return;
    if (files.length > remaining) {
      toast.error(`Galima įkelti iki ${MAX_PHOTOS} nuotraukų`);
    }

    setBusy(true);
    const added: string[] = [];
    let failed = 0;
    for (const file of files.slice(0, remaining)) {
      try {
        added.push(await fileToResizedDataUrl(file));
      } catch {
        failed += 1;
      }
    }
    setBusy(false);
    if (failed > 0) toast.error("Kai kurių failų nepavyko perskaityti kaip nuotraukų");
    if (added.length > 0) onChange([...photos, ...added]);
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={onFiles}
        disabled={busy || remaining <= 0}
      />

      {photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {photos.map((src, i) => (
            <li
              key={`${i}:${src.length}`}
              className="relative overflow-hidden rounded-xl border bg-muted"
            >
              <img
                src={src}
                alt={`Nuotrauka ${i + 1}`}
                className="aspect-[4/3] w-full object-cover"
              />
              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-xs font-semibold">
                  Viršelis
                </span>
              )}
              <button
                type="button"
                aria-label={`Pašalinti nuotrauką ${i + 1}`}
                onClick={() => onChange(photos.filter((_, j) => j !== i))}
                className="absolute right-2 top-2 grid size-7 cursor-pointer place-items-center rounded-full bg-background/90 text-foreground shadow-sm outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed bg-background px-4 py-6 text-sm font-semibold text-muted-foreground outline-none transition-colors hover:border-foreground/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
        >
          <ImagePlus className="size-6" />
          {busy
            ? "Ruošiamos nuotraukos..."
            : photos.length === 0
              ? "Pasirinkti nuotraukas"
              : "Pridėti dar"}
        </button>
      )}
    </div>
  );
}
