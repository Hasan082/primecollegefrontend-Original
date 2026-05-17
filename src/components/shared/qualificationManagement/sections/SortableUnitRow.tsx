import { useState } from "react";
import {
    Trash2,
    GripVertical, ChevronDown, ChevronUp, Pencil,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    UnitRow,
    useUpdateUnitMutation,
} from "@/redux/apis/qualification/qualificationUnitApi";
import { UnitExpandedContent } from "./UnitExpandedContent";
import { useToast } from "@/hooks/use-toast";

// ─── Sortable Unit Row ───────────────────────────────────────────────
export const SortableUnitRow = ({
    unit,
    onDelete,
    onToggleExpand,
    isExpanded,
    isCpd,
    qualificationId
}: {
    unit: UnitRow;
    onDelete: (id: string, code: string) => void;
    onToggleExpand: (id: string) => void;
    isExpanded: boolean;
    isCpd: boolean;
    qualificationId: string;
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: unit.id });
    const { toast } = useToast();
    const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation();

    // Edit dialog state
    const [editOpen, setEditOpen] = useState(false);
    const [editCode, setEditCode] = useState(unit.unit_code);
    const [editName, setEditName] = useState(unit.title);
    const [editMandatory, setEditMandatory] = useState(unit.is_mandatory);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleOpenEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditCode(unit.unit_code);
        setEditName(unit.title);
        setEditMandatory(unit.is_mandatory);
        setEditOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editCode.trim() || !editName.trim()) {
            toast({ title: "Code and Name are required", variant: "destructive" });
            return;
        }
        try {
            await updateUnit({
                unitId: unit.id,
                payload: {
                    unit_code: editCode.trim(),
                    title: editName.trim(),
                    is_mandatory: editMandatory,
                }
            }).unwrap();
            setEditOpen(false);
            toast({ title: "Unit updated successfully" });
        } catch {
            toast({ title: "Failed to update unit", variant: "destructive" });
        }
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card className={`p-0 overflow-hidden transition-all ${isExpanded ? "ring-1 ring-primary/20 shadow-md" : "hover:border-primary/30"}`}>
                <div className="flex items-center gap-3 px-4 py-3 bg-card">
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                        <GripVertical className="w-4 h-4" />
                    </button>
                    <Badge variant="outline" className="font-mono text-xs shrink-0 px-2 py-0.5 bg-muted/50">{unit.unit_code}</Badge>
                   
                
                     <span className="text-sm font-semibold flex-1 text-foreground truncate">{unit.title}  <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${unit?.is_mandatory ? "bg-red-600 text-white" : "bg-muted text-muted-foreground"}`}>
                          {unit.is_mandatory ? "Mandatory" : "Optional"}
                      </span></span>
                   
                   

                    <div className="flex items-center gap-2 mr-2">
                        {!isCpd && (
                            <>
                                {unit.has_quiz && <Badge className="text-[9px] bg-blue-600 text-white border-none uppercase font-bold tracking-tight px-1.5 py-0">Quiz</Badge>}
                                {unit.has_written_assignment && <Badge className="text-[9px] bg-amber-500 text-white border-none uppercase font-bold tracking-tight px-1.5 py-0">Written</Badge>}
                                {unit.requires_evidence && <Badge className="text-[9px] bg-emerald-600 text-white border-none uppercase font-bold tracking-tight px-1.5 py-0">Evidence</Badge>}
                            </>
                        )}
                        <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground px-1.5 py-0 bg-muted/30 border-muted-foreground/20">{unit.resource_count} resources</Badge>
                    </div>

                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted" onClick={() => onToggleExpand(unit.id)}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>

                    {/* Edit Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={handleOpenEdit}
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(unit.id, unit.unit_code)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>

                {isExpanded && <UnitExpandedContent unit={unit} isCpd={isCpd} qualificationId={qualificationId} />}
            </Card>

            {/* Edit Unit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="w-5 h-5 text-primary" />
                            Edit Unit
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-6">
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Unit Code *</Label>
                            <Input
                                value={editCode}
                                onChange={(e) => setEditCode(e.target.value)}
                                placeholder="e.g. BUS301"
                                className="h-11 font-mono"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Unit Name *</Label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="e.g. Principles of Business"
                                className="h-11 font-semibold"
                            />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border p-4">
                            <div className="space-y-0.5">
                                <Label className="font-bold text-sm">Mandatory Unit</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                                    editMandatory ? "bg-red-600 text-white" : "bg-muted text-muted-foreground"
                                }`}>
                                    {editMandatory ? "Mandatory" : "Optional"}
                                </span>
                                <Switch
                                    checked={editMandatory}
                                    onCheckedChange={setEditMandatory}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setEditOpen(false)} className="font-semibold">Cancel</Button>
                        <Button onClick={handleSaveEdit} disabled={isUpdating} className="font-bold px-6">
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};