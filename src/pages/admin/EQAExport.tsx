import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, FileText, Search, User, FolderOpen, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetEnrolledLearnersQuery } from "@/redux/apis/admin/learnerManagementApi";
import { useGetQualificationOptionsQuery } from "@/redux/apis/qualification/qualificationApi";

type LearnerRow = {
  id: string;
  status: string;
  enrolled_at: string | null;
  learner: { id: string; name: string; learner_id: string; email: string };
  qualification: { id: string; title: string };
  trainer?: { id: string; name: string } | null;
  progress: { progress_percent: number };
  payment: { status: string; method?: string };
};

type QualificationOption = { id: string; title: string };

const EQAExport = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [qualFilter, setQualFilter] = useState("all");
  const debouncedSearch = useDebounce(search, 400);

  const { data: learnersResponse, isFetching: isLoadingLearners } = useGetEnrolledLearnersQuery({
    search: debouncedSearch?.trim() || undefined,
    qualification_id: qualFilter === "all" ? undefined : qualFilter,
    page: 1,
    page_size: 50,
  });
  const { data: qualificationsResponse } = useGetQualificationOptionsQuery(undefined);

  const learners: LearnerRow[] = learnersResponse?.data?.results ?? [];
  const totalLearners: number = learnersResponse?.data?.count ?? 0;
  const qualifications: QualificationOption[] = qualificationsResponse?.data ?? [];

  const handleExportPortfolio = (learner: LearnerRow) => {
    toast({
      title: `Exporting portfolio for ${learner.learner.name}`,
      description: "Generating ZIP containing evidence files, trainer feedback, IQA reviews, and audit log... (demo)",
    });
  };

  const handleBulkExport = () => {
    toast({
      title: "Bulk export started",
      description: `Generating portfolios for ${totalLearners} learners... (demo)`,
    });
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">EQA Portfolio Export</h1>
          <p className="text-sm text-muted-foreground">Generate full learner portfolios for External Quality Assurer review</p>
        </div>
        <Button onClick={handleBulkExport}>
          <Download className="w-4 h-4 mr-1" /> Bulk Export ({totalLearners})
        </Button>
      </div>

      {/* Info */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex gap-3 items-start">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">EQA Portfolio Contents</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Each exported portfolio includes: all submitted evidence files, trainer assessment feedback,
              trainer assessment decisions, IQA review comments and outcomes, full audit trail with timestamps,
              and qualification completion status. This supports Ofsted, DfE, and awarding body audits.
            </p>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search learners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={qualFilter} onValueChange={setQualFilter}>
          <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Qualifications</SelectItem>
            {qualifications.map((q) => <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Learner Portfolio Cards */}
      <div className="space-y-3">
        {isLoadingLearners ? (
          <p className="text-center text-sm text-muted-foreground py-10">Loading learners...</p>
        ) : learners.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">No learners found.</p>
        ) : (
          learners.map((learner) => (
            <Card key={learner.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{learner.learner.name}</p>
                      <Badge variant="outline" className="text-xs">{learner.learner.learner_id}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{learner.qualification.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">Progress: {learner.progress.progress_percent}%</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">Trainer: {learner.trainer?.name || "Unassigned"}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <Badge variant={learner.status === "completed" ? "default" : learner.status === "active" ? "secondary" : "destructive"} className="text-xs">
                        {learner.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handleExportPortfolio(learner)}>
                      <FolderOpen className="w-3.5 h-3.5 mr-1" /> Full Portfolio
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => toast({ title: "Evidence export", description: `Exporting evidence files for ${learner.learner.name}... (demo)` })}>
                      <FileText className="w-3.5 h-3.5 mr-1" /> Evidence Only
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EQAExport;
