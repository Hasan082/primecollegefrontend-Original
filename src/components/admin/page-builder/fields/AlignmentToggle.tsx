import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TextAlignment } from "@/types/pageBuilder";

interface AlignmentToggleProps {
  value: TextAlignment;
  onChange: (v: TextAlignment) => void;
}

const AlignmentToggle = ({ value, onChange }: AlignmentToggleProps) => (
  <div className="shrink-0">
    <Label className="text-xs text-muted-foreground mb-1 block">Align</Label>
    <div className="flex gap-1">
      {(["left", "center", "right"] as const).map((align) => (
        <Button
          key={align}
          type="button"
          variant={value === align ? "default" : "outline"}
          size="sm"
          className="h-9 w-9 p-0 text-xs capitalize"
          onClick={() => onChange(align)}
        >
          {align === "left" ? "L" : align === "center" ? "C" : "R"}
        </Button>
      ))}
    </div>
  </div>
);

export default AlignmentToggle;
