import { useNavigate } from "react-router-dom";
import { Flag, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
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

const IQAReferrals = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetIqaSamplesQuery({
    status: "trainer_review",
    mine: true,
  });

  const referrals = data?.results ?? [];

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

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold">IQA Referrals</h1>
        <p className="text-sm text-muted-foreground">
          Assessments referred back to you by the IQA that require a response.
        </p>
      </div>

      {referrals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <Flag className="mb-3 h-8 w-8 opacity-40" />
            <p className="font-medium">No pending IQA referrals</p>
            <p className="text-sm">
              You're all clear — no assessments are awaiting your response.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {referrals.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer border-amber-200 hover:border-amber-400 transition-colors"
              onClick={() => navigate(`/trainer/iqa-referral/${item.id}`)}
            >
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{item.unit.title}</p>
                    <Badge variant="secondary" className="shrink-0">
                      IQA Referred
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.learner.name}
                    {" · "}
                    {item.qualification.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reviewed {formatDate(item.reviewed_at)}
                    {item.iqa_reviewer
                      ? ` by ${item.iqa_reviewer.name}`
                      : ""}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default IQAReferrals;
