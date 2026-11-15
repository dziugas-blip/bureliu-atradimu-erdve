import { Check } from "lucide-react";
import type { ReactNode } from "react";
import {
  DEFAULT_TIMES,
  WEEKDAYS,
  invalidDays,
  type DayTimes,
  type WeekSchedule,
  type Weekday,
} from "@/lib/schedule";
import { cn } from "@/lib/utils";
import { TimeSelect } from "./TimeSelect";

interface SchedulePickerProps {
  id?: string;
  value: WeekSchedule;
  /** True when there is no fixed timetable and times are agreed individually. */
  flexible: boolean;
  /** Reports both together: choosing "flexible" clears the days, and ticking a day unsets it. */
  onChange: (value: WeekSchedule, flexible: boolean) => void;
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "bg-background text-muted-foreground hover:border-foreground/60 hover:bg-secondary hover:text-foreground",
      )}
    >
      {active && <Check className="size-4" />}
      {children}
    </button>
  );
}

/** Tick the days and set a time for each, or say the time is agreed individually. */
export function SchedulePicker({ id, value, flexible, onChange }: SchedulePickerProps) {
  const bad = invalidDays(value);
  const chosenDays = WEEKDAYS.filter((day) => value[day]);

  const toggle = (day: Weekday) => {
    const next = { ...value };
    if (next[day]) delete next[day];
    else next[day] = DEFAULT_TIMES;
    onChange(next, false);
  };
  const setTime = (day: Weekday, patch: Partial<DayTimes>) =>
    onChange({ ...value, [day]: { ...(value[day] ?? DEFAULT_TIMES), ...patch } }, false);

  return (
    <div id={id} tabIndex={-1} className="space-y-3 outline-none">
      <div className="flex flex-wrap gap-2">
        {WEEKDAYS.map((day) => (
          <Pill key={day} active={value[day] !== undefined} onClick={() => toggle(day)}>
            {day}
          </Pill>
        ))}
        <Pill active={flexible} onClick={() => onChange({}, !flexible)}>
          Laikas derinamas individualiai
        </Pill>
      </div>

      {chosenDays.length > 0 && (
        <ul className="divide-y rounded-xl border">
          {chosenDays.map((day) => {
            const times = value[day] ?? DEFAULT_TIMES;
            const invalid = bad.includes(day);
            return (
              <li key={day} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <span className="w-32 text-sm font-semibold">{day}</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <label htmlFor={`${id}-${day}-from`}>nuo</label>
                  <TimeSelect
                    id={`${id}-${day}-from`}
                    value={times.from}
                    onChange={(from) => setTime(day, { from })}
                    invalid={invalid}
                  />
                  <label htmlFor={`${id}-${day}-to`}>iki</label>
                  <TimeSelect
                    id={`${id}-${day}-to`}
                    value={times.to}
                    onChange={(to) => setTime(day, { to })}
                    invalid={invalid}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
