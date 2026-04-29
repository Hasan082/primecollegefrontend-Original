import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useGetIqaSampleDetailQuery, useGetSampleFeedbackQuery } from "@/redux/apis/iqa/iqaApi";
import { useRespondToIQAReferralMutation } from "@/redux/apis/trainer/trainerReviewApi";
import { getReviewStatusLabel } from "@/lib/iqaStatus";

const BAND_OPTIONS = [
  { value: "high", label: "High" },
  { value: "good", label: "Good" },
  { value: "satisfactory", label: "Satisfactory" },
  { value: "needs_improvement", label: "Needs Improvement" },
];

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const IQAReferralResponse = () => {
  const { sampleId } = useParams<{ sampleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [updatedFeedback, setUpdatedFeedback] = useState("");
  const [updatedBand, setUpdatedBand] = useState("");
  const [requestResubmission, setRequestResubmission] = useState(false);
  const [trainerResponseToIqa, setTrainerResponseToIqa] = useState("");

  const { data: sample, isLoading, isError } = useGetIqaSampleDetailQuery(sampleId || "", {
    skip: !sampleId,
  });
  const { data: feedbackData } = useGetSampleFeedbackQuery(sampleId || "", {
    skip: !sampleId,
  });
  const feedbackItems = feedbackData?.results || [];

  const [respondToReferral, { isLoading: isSubmitting }] = useRespondToIQAReferralMutation();

  const triggerSubmission = sample?.unit_signoff?.trigger_submission;

  const canSubmit = updatedFeedback.trim().length >= 10;

  const handleSubmit = async () => {
    if (!sampleId || !canSubmit) return;
    try {
      const result = await respondToReferral({
        sampleId,
        body: {
          updated_feedback: updatedFeedback.trim(),
          updated_band: updatedBand || undefined,
          request_learner_resubmission: requestResubmission,
          trainer_response_to_iqa: trainerResponseToIqa.trim() || undefined,
        },
      }).unwrap();

      toast({
        title: requestResubmission
          ? "Learner resubmission requested"
          : "Assessment updated — re-queued for IQA",
        description: result.message,
      });
      navigate("/trainer/dashboard");
    } catch {
      toast({
        title: "Submission failed",
        description: "Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !sample) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-destructive" />
        <p>IQA sample not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  if (sample.review_status !== "trainer_review") {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>
          This sample is not awaiting your response.{" "}
          <strong>Current status:</strong>{" "}
          {getReviewStatusLabel(sample.review_status)}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Respond to IQA Referral</h1>
          <p className="text-sm text-muted-foreground">
            {sample.unit.title} — {sample.learner.name}
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          IQA Referred
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left — IQA feedback and submission context */}
        <div className="space-y-4">
          {/* IQA feedback items */}
          {feedbackItems.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-amber-700">
                  IQA Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {feedbackItems.map((item, i) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-3 text-sm ${
                      i === 0
                        ? "border-amber-200 bg-amber-50"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <p className="font-medium text-amber-800">{item.comments}</p>
                    {item.action_type && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Action type: {item.action_type.replace(/_/g, " ")}
                      </p>
                    )}
                    {item.affected_criteria?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.affected_criteria.map((c: string) => (
                          <Badge key={c} variant="outline" className="text-xs">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.created_by?.name} — {formatDate(item.created_at)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Submission snapshot */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Submission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Learner</span>
                <span className="font-medium">{sample.learner.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit</span>
                <span className="font-medium">{sample.unit.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submission type</span>
                <span className="capitalize">
                  {triggerSubmission?.submission_type?.replace(/_/g, " ") ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted</span>
                <span>{formatDate(triggerSubmission?.submitted_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trainer outcome</span>
                <span className="capitalize">
                  {triggerSubmission?.status?.replace(/_/g, " ") ?? "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IQA reviewed</span>
                <span>{formatDate(sample.reviewed_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* IQA referral note if in comments */}
          {sample.review_comments && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">IQA Review Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {sample.review_comments}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — Trainer response form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Response</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Updated feedback */}
              <div className="space-y-2">
                <Label>
                  Updated Assessment Feedback{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={updatedFeedback}
                  onChange={(e) => setUpdatedFeedback(e.target.value)}
                  rows={6}
                  placeholder="Update your feedback to address the IQA's concern..."
                />
                {updatedFeedback.trim().length > 0 &&
                  updatedFeedback.trim().length < 10 && (
                    <p className="text-xs text-destructive">
                      Minimum 10 characters required.
                    </p>
                  )}
              </div>

              {/* Updated band (optional) */}
              <div className="space-y-2">
                <Label>Update Assessment Band (optional)</Label>
                <Select value={updatedBand} onValueChange={setUpdatedBand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Keep existing band..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BAND_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes back to IQA */}
              <div className="space-y-2">
                <Label>Notes to IQA (optional)</Label>
                <Textarea
                  value={trainerResponseToIqa}
                  onChange={(e) => setTrainerResponseToIqa(e.target.value)}
                  rows={3}
                  placeholder="Explain what you have changed and why..."
                />
              </div>

              {/* Learner resubmission toggle */}
              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-sm font-medium">
                  Does this learner need to resubmit?
                </p>
                <p className="text-xs text-muted-foreground">
                  Only you (the trainer) can request a learner resubmission. IQA
                  cannot do this directly.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={!requestResubmission ? "default" : "outline"}
                    onClick={() => setRequestResubmission(false)}
                  >
                    No — re-queue for IQA
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={requestResubmission ? "destructive" : "outline"}
                    onClick={() => setRequestResubmission(true)}
                  >
                    Yes — request resubmission
                  </Button>
                </div>
                {requestResubmission && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                    The learner will see a resubmission request and will be able
                    to submit new work. The IQA will review the new cycle.
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting || !canSubmit}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {requestResubmission
                  ? "Request Learner Resubmission"
                  : "Update Assessment & Re-queue for IQA"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IQAReferralResponse;
