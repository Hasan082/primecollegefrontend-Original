import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { BlockType } from "@/types/pageBuilder";

import { ITEM_FIELDS, MEDIA_ENABLED_BLOCKS } from "./ItemFieldDefs";
import { DynamicIcon, MediaPicker } from "./MediaPicker";

const getNewItem = (blockType: BlockType): any => {
  const fields = ITEM_FIELDS[blockType];
  const item: any = {};
  fields?.forEach((f) => { item[f.key] = ""; });
  if (MEDIA_ENABLED_BLOCKS.includes(blockType)) {
    item.mediaType = "icon";
    item.icon = "Star";
    item.image = "";
  }
  return item;
};

const ItemListEditor = ({ blockType, items, onChange, onImageUpload, isUploading }: any) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const fields = ITEM_FIELDS[blockType];
  const hasMedia = MEDIA_ENABLED_BLOCKS.includes(blockType);

  if (!fields) return <p className="text-xs text-muted-foreground italic">Item editing is not available for this block type.</p>;

  const updateItem = (idx: number, key: string, value: any) => {
    onChange(items.map((item: any, i: number) => i === idx ? { ...item, [key]: value } : item));
  };

  const addItem = () => {
    const next = [...items, getNewItem(blockType)];
    onChange(next); setExpandedIdx(next.length - 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <Label>Items ({items.length})</Label>
        <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={addItem}><Plus className="h-3 w-3 mr-1" /> Add Item</Button>
      </div>

      <div className="border rounded-md divide-y bg-muted/10 max-h-[460px] overflow-y-auto">
        {items.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground italic">No items yet</p>}
        {items.map((item: any, i: number) => {
          const isOpen = expandedIdx === i;
          return (
            <div key={i} className="bg-background">
              <div className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-muted/30" onClick={() => setExpandedIdx(isOpen ? null : i)}>
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30" />
                <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-[10px]">{i + 1}</Badge>
                {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <span className="text-sm truncate flex-1 font-medium">{item.title || item.question || item.name || `Item ${i+1}`}</span>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={(e) => { e.stopPropagation(); onChange(items.filter((_: any, idx: number) => idx !== i)); }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>

              {isOpen && (
                <div className="px-3 pb-3 pt-1 space-y-3 bg-muted/5 border-t border-dashed">
                  {hasMedia && <MediaPicker item={item} onUpdate={(k: string, v: any) => updateItem(i, k, v)} onImageUpload={(f: File, k: string) => onImageUpload(f, `items.${i}.${k}`)} isUploading={isUploading} />}
                  {fields.map((f) => (
                    <div key={f.key}>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-tight">{f.label}</Label>
                      {f.type === "textarea" ? (
                        <Textarea value={item[f.key] || ""} onChange={(e) => updateItem(i, f.key, e.target.value)} placeholder={f.placeholder} className="mt-1 text-sm min-h-[70px]" />
                      ) : (
                        <Input value={item[f.key] || ""} onChange={(e) => updateItem(i, f.key, e.target.value)} placeholder={f.placeholder} className="mt-1 h-8 text-sm" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItemListEditor;
