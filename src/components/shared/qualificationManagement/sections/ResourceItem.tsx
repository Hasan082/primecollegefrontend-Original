import {
    FileText, ExternalLink, Download, Clock,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    UnitResource,
} from "@/redux/apis/qualification/qualificationUnitApi";

// ─── Resource Item Component ───────────────────────────────────────────
export const ResourceItem = ({
    resource,
    onDelete
}: {
    resource: UnitResource;
    onDelete: (id: string) => void
}) => {
    return (
        <div className="flex items-center justify-between text-xs bg-background rounded-xl px-3 py-2 border shadow-sm group">
            <div className="flex items-center gap-3 overflow-hidden">
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
    );
};