import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ShieldAlert,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetChecklistCompletionsQuery,
  useGetIqaSamplesQuery,
} from "@/redux/apis/iqa/iqaApi";

type DecisionFilter = "all" | "approved" | "action_required" | "reassessed" | "escalated";

function reviewStatusLabel(status: string): string {
  switch (status) {
    case "approved": return "Approved";
    case "action_required": return "Action Required";
    case "trainer_review": return "Referred to Trainer";
    case "reassessed": return "Re-assessed";
    case "escalated": return "Escalated";
    case "learner_resubmit_requested": return "Learner Resubmit Requested";
    case "pending": return "Pending";
    case "in_progress": return "In Progress";
    default: return status;
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 gap-1">
        <CheckCircle2 className="w-3 h-3" /> Approved
      </Badge>
    );
  }
  if (status === "action_required" || status === "trainer_review") {
    return (
      <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 gap-1">
        <RotateCcw className="w-3 h-3" /> Referred Back
      </Badge>
    );
  }
  if (status === "escalated") {
    return (
      <Badge variant="outline" className="border-red-300 text-red-700 bg-red-50 gap-1">
        <ShieldAlert className="w-3 h-3" /> Escalated
      </Badge>
    );
  }
  if (status === "reassessed") {
    return (
      <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 gap-1">
        <RotateCcw className="w-3 h-3" /> Re-assessed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1">
      <Clock className="w-3 h-3" /> {reviewStatusLabel(status)}
    </Badge>
  );
}

const REVIEWED_STATUSES = new Set([
  "approved",
  "action_required",
  "trainer_review",
  "reassessed",
  "escalated",
  "learner_resubmit_requested",
]);

const VerificationChecklists = () => {
  const [qualFilter, setQualFilter] = useState("all");
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: samplesResponse, isLoading: isLoadingSamples } = useGetIqaSamplesQuery({ mine: true });
  const { data: completionsResponse, isLoading: isLoadingCompletions } = useGetChecklistCompletionsQuery();

  const allSamples = samplesResponse?.results || [];
  const allCompletions = completionsResponse?.results || [];

  // Only show samples the IQA has actually reviewed (not pending/in_progress)
  const reviewedSamples = useMemo(
    () => allSamples.filter((s) => REVIEWED_STATUSES.has(s.review_status)),
    [allSamples],
  );

  // Map submission_id → checklist completion for quick lookup
  const completionBySubmission = useMemo(() => {
    const map = new Map<string, typeof allCompletions[0]>();
    for (const c of allCompletions) {
      if (c.submission_id) map.set(c.submission_id, c);
    }
    return map;
  }, [allCompletions]);

  // Qualification options from reviewed samples
  const qualificationOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of reviewedSamples) {
      if (s.qualification?.id && !map.has(s.qualification.id)) {
        map.set(s.qualification.id, s.qualification.title);
      }
    }
    return Array.from(map.entries())
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [reviewedSamples]);

  const filteredSamples = useMemo(() => {
    const fromTs = fromDate ? new Date(fromDate).getTime() : null;
    const toTs = toDate ? new Date(toDate).getTime() + 86_400_000 - 1 : null;

    return reviewedSamples
      .filter((s) => {
        if (qualFilter !== "all" && s.qualification?.id !== qualFilter) return false;
        if (decisionFilter !== "all") {
          const isApproved = s.review_status === "approved";
          const isReferred = ["action_required", "trainer_review", "learner_resubmit_requested"].includes(s.review_status);
          const isReassessed = s.review_status === "reassessed";
          const isEscalated = s.review_status === "escalated";
          if (decisionFilter === "approved" && !isApproved) return false;
          if (decisionFilter === "action_required" && !isReferred) return false;
          if (decisionFilter === "reassessed" && !isReassessed) return false;
          if (decisionFilter === "escalated" && !isEscalated) return false;
        }
        const reviewedTs = s.reviewed_at ? new Date(s.reviewed_at).getTime() : null;
        if (fromTs !== null && (reviewedTs === null || reviewedTs < fromTs)) return false;
        if (toTs !== null && (reviewedTs === null || reviewedTs > toTs)) return false;
        return true;
      })
      .sort((a, b) => {
        const ta = a.reviewed_at ? new Date(a.reviewed_at).getTime() : 0;
        const tb = b.reviewed_at ? new Date(b.reviewed_at).getTime() : 0;
        return tb - ta;
      });
  }, [reviewedSamples, qualFilter, decisionFilter, fromDate, toDate]);

  const totals = useMemo(() => {
    const approved = filteredSamples.filter((s) => s.review_status === "approved").length;
    const referred = filteredSamples.filter((s) =>
      ["action_required", "trainer_review", "learner_resubmit_requested"].includes(s.review_status),
    ).length;
    return { total: filteredSamples.length, approved, referred };
  }, [filteredSamples]);

  const isLoading = isLoadingSamples || isLoadingCompletions;

  const hasFilters = qualFilter !== "all" || decisionFilter !== "all" || fromDate || toDate;

  return (
    <div className="space-y-6">
      <Link
        to="/iqa/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6" /> My Verifications
        </h1>
        <p className="text-sm text-muted-foreground">
          Audit log of every IQA decision you have submitted across qualifications and units.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 grid gap-3 md:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Qualification
            </label>
            <Select value={qualFilter} onValueChange={setQualFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Qualifications" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Qualifications</SelectItem>
                {qualificationOptions.map((q) => (
                  <SelectItem key={q.id} value={q.id}>
                    {q.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Decision
            </label>
            <Select
              value={decisionFilter}
              onValueChange={(v) => setDecisionFilter(v as DecisionFilter)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="action_required">Referred Back</SelectItem>
                <SelectItem value="reassessed">Re-assessed</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              From
            </label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              To
            </label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Totals row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="outline">Total: {totals.total}</Badge>
          <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
            Approved: {totals.approved}
          </Badge>
          <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
            Referred Back: {totals.referred}
          </Badge>
        </div>
        {hasFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setQualFilter("all");
              setDecisionFilter("all");
              setFromDate("");
              setToDate("");
            }}
            className="gap-1"
          >
            <Filter className="w-3.5 h-3.5" /> Clear filters
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Loading verifications...</p>
        </Card>
      ) : filteredSamples.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">
            {reviewedSamples.length === 0
              ? "You have not submitted any IQA decisions yet."
              : "No decisions match the current filters."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredSamples.map((sample) => {
            const submissionId = sample.trigger_submission?.id;
            const completion = submissionId ? completionBySubmission.get(submissionId) : undefined;

            return (
              <Card key={sample.id} className="border-border/60">
                <CardContent className="p-4 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">
                        {sample.learner?.name || "Unknown Learner"}
                      </p>
                      <span className="text-xs text-muted-foreground">·</span>
                      <p className="text-xs text-muted-foreground">
                        {sample.unit?.title || "—"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sample.qualification?.title || "—"}
                      {sample.unit?.code ? ` · ${sample.unit.code}` : ""}
                      {sample.reviewed_at
                        ? ` · ${new Date(sample.reviewed_at).toLocaleString("en-GB")}`
                        : ""}
                    </p>
                    {completion?.summary_comment ? (
                      <p className="text-xs text-muted-foreground italic line-clamp-2 mt-1">
                        "{completion.summary_comment}"
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <StatusBadge status={sample.review_status} />
                    {completion ? (
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Checklist completed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        No checklist
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VerificationChecklists;
