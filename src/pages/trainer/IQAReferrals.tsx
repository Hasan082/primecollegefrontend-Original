import { useNavigate } from "react-router-dom";
import { Flag, Loader2, AlertTriangle, ArrowRight, Clock, CheckCircle2, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetIqaSamplesQuery } from "@/redux/apis/iqa/iqaApi";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "trainer_review") {
    return (
      <Badge className="shrink-0 bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100 gap-1">
        <Clock className="w-3 h-3" /> Action Required
      </Badge>
    );
  }
  if (status === "reassessed") {
    return (
      <Badge variant="outline" className="shrink-0 border-blue-300 text-blue-700 bg-blue-50 gap-1">
        <RotateCcw className="w-3 h-3" /> Responded — Awaiting IQA
      </Badge>
    );
  }
  if (status === "learner_resubmit_requested") {
    return (
      <Badge variant="outline" className="shrink-0 border-emerald-300 text-emerald-700 bg-emerald-50 gap-1">
        <CheckCircle2 className="w-3 h-3" /> Resubmission Requested
      </Badge>
    );
  }
  return <Badge variant="secondary" className="shrink-0">{status}</Badge>;
}

const IQAReferrals = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetIqaSamplesQuery({ mine: true });

  const referrals = data?.results ?? [];
  const pending = referrals.filter((r) => r.review_status === "trainer_review");
  const handled = referrals.filter((r) => r.review_status !== "trainer_review");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-destructive" />
        <p>Failed to load IQA referrals.</p>
      </div>
    );
  }

  const renderCard = (item: typeof referrals[0]) => (
    <Card
      key={item.id}
      className="cursor-pointer hover:border-primary/40 transition-colors"
      onClick={() => navigate(`/trainer/iqa-referral/${item.id}`)}
    >
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate">{item.unit.title}</p>
            <StatusBadge status={item.review_status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {item.learner.name} · {item.qualification.title}
          </p>
          <p className="text-xs text-muted-foreground">
            Reviewed {formatDate(item.reviewed_at)}
            {item.iqa_reviewer ? ` by ${item.iqa_reviewer.name}` : ""}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="shrink-0">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold">IQA Referrals</h1>
        <p className="text-sm text-muted-foreground">
          Assessments referred back to you by the IQA.
        </p>
      </div>

      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Awaiting Your Response ({pending.length})
          </p>
          <div className="space-y-3">{pending.map(renderCard)}</div>
        </div>
      )}

      {handled.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Responded ({handled.length})
          </p>
          <div className="space-y-3">{handled.map(renderCard)}</div>
        </div>
      )}

      {referrals.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Flag className="mb-3 h-8 w-8 opacity-40" />
            <p className="font-medium">No IQA referrals</p>
            <p className="text-sm">You have no assessments referred by the IQA.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IQAReferrals;
