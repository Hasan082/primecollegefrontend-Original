import { useState } from "react";
import {
    FileText, ExternalLink, Download, Clock,
    X, Pencil, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
    UnitResource,
    useUpdateUnitResourceMutation,
} from "@/redux/apis/qualification/qualificationUnitApi";
import { useToast } from "@/hooks/use-toast";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Resource Item Component ───────────────────────────────────────────
export const ResourceItem = ({
    resource,
    onDelete,
    unitId,
}: {
    resource: UnitResource;
    onDelete: (id: string) => void;
    unitId: string;
}) => {
    const { toast } = useToast();
    const [updateResource, { isLoading: isUpdating }] = useUpdateUnitResourceMutation();
    const [editOpen, setEditOpen] = useState(false);
    const [editTitle, setEditTitle] = useState(resource.title);
    const [editMinutes, setEditMinutes] = useState(String(resource.estimated_minutes ?? 0));

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: resource.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleOpenEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditTitle(resource.title);
        setEditMinutes(String(resource.estimated_minutes ?? 0));
        setEditOpen(true);
    };

    const handleSave = async () => {
        if (!editTitle.trim()) {
            toast({ title: "Title is required", variant: "destructive" });
            return;
        }
        try {
            await updateResource({
                resourceId: resource.id,
                unitId,
                payload: {
                    title: editTitle.trim(),
                    estimated_minutes: parseInt(editMinutes, 10) || 0,
                },
            }).unwrap();
            setEditOpen(false);
            toast({ title: "Resource updated" });
        } catch {
            toast({ title: "Failed to update resource", variant: "destructive" });
        }
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className="flex items-center justify-between text-xs bg-background rounded-xl px-3 py-2 border shadow-sm group"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Drag handle */}
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
                        tabIndex={-1}
                        type="button"
                        aria-label="Drag to reorder"
                    >
                        <GripVertical className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground truncate">{resource.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase">
                            <span>{resource.resource_type}</span>
                            {resource.estimated_minutes > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {resource.estimated_minutes}m</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {resource.external_url ? (
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <a href={resource.external_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </Button>
                    ) : resource.file ? (
                        <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <a href={resource.file} target="_blank" rel="noopener noreferrer" download>
                                <Download className="w-3.5 h-3.5" />
                            </a>
                        </Button>
                    ) : null}

                    {/* Edit Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={handleOpenEdit}
                    >
                        <Pencil className="w-3 h-3" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(resource.id)}
                    >
                        <X className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </div>

            {/* Edit Resource Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="w-4 h-4 text-primary" />
                            Edit Resource
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                                Resource Title *
                            </Label>
                            <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Resource title"
                                className="h-10 font-semibold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                                Estimated Duration (minutes)
                            </Label>
                            <Input
                                type="number"
                                min={0}
                                value={editMinutes}
                                onChange={(e) => setEditMinutes(e.target.value)}
                                placeholder="0"
                                className="h-10"
                            />
                        </div>
                        <div className="rounded-lg bg-muted/30 border px-3 py-2">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Type</p>
                            <p className="text-sm font-semibold capitalize mt-0.5">{resource.resource_type}</p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setEditOpen(false)} className="font-semibold">Cancel</Button>
                        <Button onClick={handleSave} disabled={isUpdating} className="font-bold px-6">
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};