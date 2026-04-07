import { useRef } from "react";
import { Upload, ImageIcon, AlignLeft, AlignRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/Image";

interface ImageFieldProps {
  value: any;
  onChange: (file: File) => void;
  isUploading: boolean;
  imagePosition?: string;
  onPositionChange?: (v: string) => void;
}

const ImageField = ({
  value,
  onChange,
  isUploading,
  imagePosition,
  onPositionChange,
}: ImageFieldProps) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file);
  };

  const isString = typeof value === "string";
  const isObject = typeof value === "object" && value !== null;
  const hasValue = (isString && value.length > 0) || (isObject && (value.small || value.original));

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Image</Label>
      {hasValue && (
        <div className="rounded-lg border border-border overflow-hidden bg-muted/30 max-h-40 flex items-center justify-center">
          {isString ? (
            <img src={value} alt="Preview" className="max-h-40 object-contain" />
          ) : (
            <Image image={value} className="max-h-40 object-contain" />
          )}
        </div>
      )}
      <div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => fileRef.current?.click()} disabled={isUploading}>
          <Upload className="h-3.5 w-3.5 mr-1.5" /> 
          {isUploading ? "Uploading..." : value ? "Change Image" : "Upload Image"}
        </Button>
      </div>
      {onPositionChange && (
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Image Position</Label>
          <div className="flex gap-2">
            <Button type="button" variant={imagePosition === "left" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => onPositionChange("left")}>
              <AlignLeft className="h-3.5 w-3.5 mr-1.5" /> Left
            </Button>
            <Button type="button" variant={imagePosition === "right" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => onPositionChange("right")}>
              <AlignRight className="h-3.5 w-3.5 mr-1.5" /> Right
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageField;
