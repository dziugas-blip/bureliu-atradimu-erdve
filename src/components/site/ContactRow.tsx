import { Check, Copy, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ContactRowProps {
  icon: LucideIcon;
  /** The text shown and copied, e.g. a phone number. */
  value: string;
  /** Where the value itself leads: a `tel:` or `mailto:` link. */
  href: string;
  /** Says what the link does, e.g. "Skambinti". */
  actionLabel: string;
}

/** A phone or email line: tap the value to call or write, or press the button to copy it. */
export function ContactRow({ icon: Icon, value, href, actionLabel }: ContactRowProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Nukopijuota", { description: value });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Nepavyko nukopijuoti", {
        description: "Pažymėkite tekstą ir kopijuokite ranka.",
      });
    }
  }

  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <a
        href={href}
        title={actionLabel}
        className="min-w-0 flex-1 select-all break-all hover:text-primary"
      >
        {value}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={`Kopijuoti: ${value}`}
        title="Kopijuoti"
        className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md border bg-background text-muted-foreground outline-none transition-colors hover:border-foreground/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        {copied ? <Check className="size-4 text-teal" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}
