import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

const Field = ({ label, value, onChange }: FieldProps) => (
  <div>
    <Label>{label}</Label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default Field;
