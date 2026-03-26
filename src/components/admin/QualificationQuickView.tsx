import { useNavigate, Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Loader2, 
  Edit, 
  Calendar, 
  BookOpen, 
  Clock, 
  Award, 
  Eye,
  GraduationCap,
  FileText,
  Briefcase,
  AlertCircle,
  Hash,
  Shield,
  ChevronRight,
  ClipboardList,
  PenLine,
  Settings2
} from "lucide-react";
import { useGetQualificationQuickViewQuery } from "@/redux/apis/qualification/qualificationMainApi";
import { useGetUnitsQuery } from "@/redux/apis/qualification/qualificationUnitApi";
import { cn, formatPrice } from "@/lib/utils";

interface Props {
  qualificationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StatItem = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) => (
  <div className="flex items-center gap-3 text-sm">
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase text-muted-foreground font-medium leading-none mb-1">{label}</p>
      <p className="font-semibold text-foreground truncate">{value}</p>
    </div>
  </div>
);

const QualificationQuickView = ({ qualificationId, open, onOpenChange }: Props) => {
  const navigate = useNavigate();
  
  const { data: q, isLoading: isLoadingQ, isError: isErrorQ } = useGetQualificationQuickViewQuery(qualificationId, {
    skip: !qualificationId || !open,
  });

  const { data: units, isLoading: isLoadingUnits } = useGetUnitsQuery(qualificationId!, {
    skip: !qualificationId || !open,
  });

  const handleEdit = () => {
    if (q?.id) {
      onOpenChange(false);
      navigate(`/admin/qualifications/${q.id}/edit`);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      active: "default",
      draft: "secondary",
      archived: "outline",
      inactive: "destructive",
    };
    return (
      <Badge variant={map[status] || "outline"} className="capitalize px-2 py-0 text-[10px]">
        {status}
      </Badge>
    );
  };

  const isLoading = isLoadingQ || isLoadingUnits;
  const isError = isErrorQ;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden border-none shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <DialogTitle className="flex items-start gap-4 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xl font-bold text-foreground leading-tight line-clamp-2" title={q?.title}>
                {q?.title || "Qualification Details"}
              </span>
              <p className="text-xs text-muted-foreground font-semibold mt-1 flex items-center gap-2">
                <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{q?.qualification_code || "---"}</span>
                {q?.status && statusBadge(q.status)}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleEdit} className="shrink-0 h-9 gap-2 font-bold text-xs ring-offset-background hover:bg-primary/5">
              <Edit className="w-3.5 h-3.5" />
              Quick Edit
            </Button>
          </DialogTitle>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-transparent h-auto p-0 gap-8 justify-start">
              <TabsTrigger 
                value="overview" 
                className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none text-xs font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="units" 
                className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none text-xs font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary"
              >
                Units ({units?.length || 0})
              </TabsTrigger>
              <TabsTrigger 
                value="sessions" 
                className="bg-transparent p-0 pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent shadow-none text-xs font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-primary"
              >
                Sessions
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        <ScrollArea className="max-h-[500px]">
          <div className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">Synchronizing Data</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-destructive text-center px-10">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Communication Failure</p>
                  <p className="text-xs text-muted-foreground mt-1">We couldn't retrieve the qualification details from the server.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="mt-2 text-xs font-bold border-destructive/20 text-destructive hover:bg-destructive/5">Close View</Button>
              </div>
            ) : q ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsContent value="overview" className="m-0 p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-6">
                    <StatItem label="Category" value={q.category_name || q.category || "Uncategorised"} icon={BookOpen} />
                    <StatItem label="Level" value={q.level_name || q.level || "N/A"} icon={Award} />
                    <StatItem label="Awarding Body" value={q.awarding_body_name || q.awarding_body || "N/A"} icon={Shield} />
                    <StatItem 
                      label="Current Price" 
                      value={formatPrice(q.current_price, q.currency)} 
                      icon={Briefcase} 
                    />
                    <StatItem label="Duration" value={q.course_duration_text || "Not set"} icon={Clock} />
                    <StatItem label="Total Units" value={String(q.total_units ?? 0)} icon={FileText} />
                    <StatItem label="Total Sessions" value={String(q.total_sessions ?? 0)} icon={Hash} />
                  </div>

                  {/* Description */}
                  {q.short_description && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2">
                        Summary Details
                      </h4>
                      <p className="text-sm text-foreground/80 leading-relaxed font-medium bg-muted/30 p-5 rounded-2xl border border-border/50">
                        {q.short_description}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-dashed">
                    <p className="text-[10px] text-muted-foreground/60 font-medium italic">
                      * Full configuration including prerequisites and pricing rules are available in the Edit dashboard.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="units" className="m-0 p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {units && units.length > 0 ? (
                    <div className="grid gap-3">
                      {units.map((unit) => (
                        <div key={unit.id} className="p-4 rounded-xl border bg-background hover:bg-muted/10 transition-colors group">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                                <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-foreground truncate">{unit.title}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5 flex items-center gap-2">
                                  <span className="font-mono">{unit.unit_code}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {unit.resource_count} resources</span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {unit.has_quiz && <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center" title="Quiz Enabled"><ClipboardList className="w-3 h-3 text-blue-600" /></div>}
                              {unit.has_written_assignment && <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center" title="Written Assignment Enabled"><PenLine className="w-3 h-3 text-amber-600" /></div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/10 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <FileText className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                      <p className="text-xs font-bold text-muted-foreground">No units have been configured yet.</p>
                      <Button variant="link" size="sm" onClick={handleEdit} className="text-[11px] font-bold">Add Units in Dashboard</Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="sessions" className="m-0 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/10 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground">Detailed Session Information</p>
                      <p className="text-[10px] text-muted-foreground mt-1 max-w-[200px] mx-auto leading-relaxed">
                        Session dates, locations, and capacity management is only available in the full edit view.
                      </p>
                    </div>
                    <Button variant="link" size="sm" onClick={handleEdit} className="text-[11px] font-bold">Go to Sessions Dashboard</Button>
                  </div>
                </TabsContent>
              </Tabs>
            ) : null}
          </div>
        </ScrollArea>

        <div className="px-6 py-5 border-t bg-muted/40 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
            ID: <span className="font-mono">{q?.id?.split('-')[0] || "---"}</span>
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
              Close View
            </Button>
            <Button asChild size="sm" className="gap-2 px-6 font-bold shadow-lg shadow-primary/20">
              <Link to={`/admin/qualifications/${q?.id}`}>
                <Settings2 className="w-3.5 h-3.5" />
                Unit Management
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QualificationQuickView;
