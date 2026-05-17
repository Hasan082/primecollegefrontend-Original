import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetEnrolledLearnersQuery } from "@/redux/apis/admin/learnerManagementApi";
import { useGetSignoffLearnersQuery } from "@/redux/apis/iqa/iqaApi";
import { useGetTrainerOptionsQuery } from "@/redux/apis/staffApi";

// Raw shape returned by GET /api/enrolments/admin/learners/
interface RawEnrolmentRow {
  id: string;
  learner: {
    id: string;
    name: string;
    learner_id: string;
    email: string;
    phone?: string;
  };
  qualification: {
    id: string;
    title: string;
  };
  status: string;
}

// ── Learner / Enrolment Combobox (server-driven search) ──────────────────────

interface LearnerComboboxProps {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export const LearnerCombobox = ({
  value,
  onChange,
  placeholder = "Search learner…",
}: LearnerComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isFetching } = useGetEnrolledLearnersQuery(
    { search: debouncedSearch || undefined, page: 1, page_size: 10 },
    { skip: !open },
  );

  const rows: RawEnrolmentRow[] = data?.data?.results ?? [];

  useEffect(() => {
    if (!value) setSelectedLabel(null);
  }, [value]);

  const handleSelect = (row: RawEnrolmentRow) => {
    onChange(row.id);
    setSelectedLabel(`${row.learner.name} — ${row.learner.email}`);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-left h-9"
        >
          <span className={cn("truncate text-sm", !selectedLabel && "text-muted-foreground")}>
            {selectedLabel ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name, email or ID…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-64">
            {isFetching ? (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
              </div>
            ) : rows.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                {debouncedSearch ? "No learners found." : "Type to search learners."}
              </div>
            ) : (
              <CommandGroup>
                {rows.map((row) => (
                  <CommandItem
                    key={row.id}
                    value={row.id}
                    onSelect={() => handleSelect(row)}
                    className="flex items-start gap-2 py-2"
                  >
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        value === row.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{row.learner.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {row.learner.email} · {row.learner.learner_id}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {row.qualification.title}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ── Signoff Learner Combobox (scoped: only learners who have sign-offs) ──────

interface SignoffLearnerComboboxProps {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export const SignoffLearnerCombobox = ({
  value,
  onChange,
  placeholder = "Search learner…",
}: SignoffLearnerComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isFetching } = useGetSignoffLearnersQuery(
    { search: debouncedSearch || undefined },
    { skip: !open },
  );

  const rows = data?.results ?? [];

  useEffect(() => {
    if (!value) setSelectedLabel(null);
  }, [value]);

  const handleSelect = (row: { enrolment_id: string; name: string; email: string; learner_id: string }) => {
    onChange(row.enrolment_id);
    setSelectedLabel(`${row.name} — ${row.email}`);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-left h-9"
        >
          <span className={cn("truncate text-sm", !selectedLabel && "text-muted-foreground")}>
            {selectedLabel ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name, email or ID…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-64">
            {isFetching ? (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
              </div>
            ) : rows.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                {debouncedSearch ? "No learners found." : "Type to search learners with sign-offs."}
              </div>
            ) : (
              <CommandGroup>
                {rows.map((row) => (
                  <CommandItem
                    key={row.enrolment_id}
                    value={row.enrolment_id}
                    onSelect={() => handleSelect(row)}
                    className="flex items-start gap-2 py-2"
                  >
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        value === row.enrolment_id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{row.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {row.email} · {row.learner_id}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ── Trainer Combobox (local filter) ──────────────────────────────────────────

interface TrainerComboboxProps {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export const TrainerCombobox = ({
  value,
  onChange,
  placeholder = "Select trainer…",
}: TrainerComboboxProps) => {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetTrainerOptionsQuery();
  const trainers = data?.data ?? [];

  const selectedTrainer = trainers.find((t) => t.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal text-left h-9"
        >
          <span className={cn("truncate text-sm", !selectedTrainer && "text-muted-foreground")}>
            {selectedTrainer?.name ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search trainer by name…" />
          <CommandList className="max-h-60">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
              </div>
            ) : trainers.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No trainers available.
              </div>
            ) : (
              <CommandGroup>
                {trainers.map((trainer) => (
                  <CommandItem
                    key={trainer.id}
                    value={trainer.name}
                    onSelect={() => {
                      onChange(trainer.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value === trainer.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {trainer.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
