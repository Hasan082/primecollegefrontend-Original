import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Calendar, Clock, FileText, Download, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { pendingSubmissions } from "@/data/trainerMockData";

type Outcome = "Competent" | "Resubmission Required" | "Not Yet Competent" | "";

const AssessmentReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const submission = pendingSubmissions.find((s) => s.id === id);
  const [outcome, setOutcome] = useState<Outcome>("");
  const [feedback, setFeedback] = useState("");

  if (!submission) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Submission not found.</p>
        <Link to="/trainer/dashboard" className="text-primary hover:underline mt-4 inline-block">Back to Dashboard</Link>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!outcome) {
      toast({ title: "Please select an outcome", variant: "destructive" });
      return;
    }
    if (!feedback.trim()) {
      toast({ title: "Please provide feedback", variant: "destructive" });
      return;
    }
    toast({ title: "Assessment submitted", description: `Outcome: ${outcome}` });
    navigate("/trainer/dashboard");
  };

  const outcomes: { value: Outcome; label: string; desc: string }[] = [
    { value: "Competent", label: "Competent / Pass", desc: "All criteria met successfully" },
    { value: "Resubmission Required", label: "Resubmission Required", desc: "Minor gaps, needs revision" },
    { value: "Not Yet Competent", label: "Not Yet Competent", desc: "Significant gaps identified" },
  ];

  return (
    <div>
      <Link to="/trainer/dashboard" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-1">Assessment Review</h1>
      <p className="text-muted-foreground mb-8">Review evidence and provide assessment outcome</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learner Info */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Learner Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Learner Name</p>
                  <p className="font-semibold text-sm">{submission.learnerName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Learner ID</p>
                  <p className="font-semibold text-sm">{submission.learnerId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Submitted Date</p>
                  <p className="font-semibold text-sm">{submission.submittedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Days Waiting</p>
                  <Badge className="bg-primary text-primary-foreground text-xs">{submission.daysWaiting} days</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Unit Details */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Unit Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Qualification</p>
                <p className="font-semibold text-sm">{submission.qualification}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unit</p>
                <p className="font-semibold text-sm">{submission.unitCode}: {submission.unitTitle}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">Assessment Criteria</p>
                <ul className="space-y-1">
                  {submission.criteria.map((c, i) => (
                    <li key={i} className="text-sm text-foreground">• {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>

          {/* Submitted Evidence */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-1">Submitted Evidence</h2>
            <p className="text-sm text-muted-foreground mb-4">Review the learner's submitted files</p>
            <div className="space-y-3">
              {submission.files.map((f, i) => (
                <div key={i} className="flex items-center justify-between border border-border rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.type} • {f.size}</p>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-primary">Evidence Preview</p>
                <p className="text-xs text-primary/80">Download the files to review the full evidence. Ensure all assessment criteria are addressed with sufficient detail and authenticity.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Assessment Outcome */}
        <div className="space-y-6">
          <Card className="p-6 border-2 border-primary/20">
            <h2 className="text-lg font-bold text-primary mb-1">Assessment Outcome</h2>
            <p className="text-sm text-muted-foreground mb-4">Select outcome and provide feedback</p>

            <Label className="text-sm font-semibold">Select Outcome</Label>
            <div className="space-y-2 mt-2 mb-6">
              {outcomes.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setOutcome(o.value)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    outcome === o.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="font-semibold text-sm">{o.label}</p>
                  <p className="text-xs text-muted-foreground">{o.desc}</p>
                </button>
              ))}
            </div>

            <Label className="text-sm font-semibold text-primary">Feedback for Learner</Label>
            <textarea
              className="w-full mt-2 border border-border rounded-xl p-3 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-ring resize-none bg-background"
              placeholder="Provide detailed feedback on the evidence submitted. If resubmission is required, clearly identify which criteria need further work..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1 mb-4">Constructive feedback helps learners understand the assessment decision</p>

            <button
              onClick={handleSubmit}
              className="w-full bg-secondary text-secondary-foreground h-11 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Submit Assessment
            </button>
          </Card>

          {/* Guidance */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-primary mb-3">Assessment Guidance</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">Competent / Pass</p>
                <p className="text-muted-foreground text-xs">Evidence clearly demonstrates all required criteria with appropriate detail</p>
              </div>
              <div>
                <p className="font-semibold">Resubmission Required</p>
                <p className="text-muted-foreground text-xs">Most criteria met but some areas need clarification or additional evidence</p>
              </div>
              <div>
                <p className="font-semibold">Not Yet Competent</p>
                <p className="text-muted-foreground text-xs">Significant gaps in evidence or criteria not sufficiently addressed</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssessmentReview;
