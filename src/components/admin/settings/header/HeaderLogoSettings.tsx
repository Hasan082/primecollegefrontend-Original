import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface HeaderLogoSettingsProps {
  logo: string | null;
  altText: string;
  onUpdate: (field: string, value: string) => void;
}

const HeaderLogoSettings = ({ logo, altText, onUpdate }: HeaderLogoSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Logo Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="header_logo">Logo URL</Label>
          <Input
            id="header_logo"
            placeholder="Logo image URL"
            value={logo || ""}
            onChange={(e) => onUpdate("header_logo", e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="header_logo_alt_text">Alt Text</Label>
          <Input
            id="header_logo_alt_text"
            placeholder="e.g. Prime College"
            value={altText}
            onChange={(e) => onUpdate("header_logo_alt_text", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default HeaderLogoSettings;
