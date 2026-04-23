import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ChevronRight,
  FileText,
  Layers3,
  LockKeyhole,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import QualificationDetails from "@/components/admin/qualification-create/QualificationDetails";
import QualificationMain from "@/components/admin/qualification-create/QualificationMain";
import QualificationPrice from "@/components/admin/qualification-create/QualificationPrice";
import QualificationSessions from "@/components/admin/qualification-create/QualificationSessions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useGetQualificationMainQuery } from "@/redux/apis/qualification/qualificationMainApi";

type StepDefinition = {
  id: number;
  label: string;
  title: string;
  description: string;
  icon: typeof Layers3;
  locked?: boolean;
};

const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: 1,
    label: "Main",
    title: "Main Information",
    description: "Identity, taxonomy, visibility, and the core qualification shell.",
    icon: Layers3,
  },
  {
    id: 2,
    label: "Details",
    title: "Details",
    description: "Long description, assessment rules, certificate settings, and CPD-specific fields.",
    icon: FileText,
  },
  {
    id: 3,
    label: "Pricing",
    title: "Pricing",
    description: "Create and manage price records without leaving the editor.",
    icon: ChevronRight,
  },
  {
    id: 4,
    label: "Sessions",
    title: "Sessions",
    description: "Available only when the qualification is session-based.",
    icon: LockKeyhole,
    locked: true,
  },
];

const QualificationCreateOrEdit = () => {
  const { qualificationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: qualificationData } = useGetQualificationMainQuery(qualificationId, {
    skip: !qualificationId,
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStep = Number(searchParams.get("step")) || 1;
  const isSessionBased = Boolean(qualificationData?.data?.is_session);

  const visibleSteps = useMemo(
    () => STEP_DEFINITIONS.filter((step) => step.id !== 4 || isSessionBased),
    [isSessionBased],
  );

  const safeStep = visibleSteps.some((step) => step.id === requestedStep)
    ? requestedStep
    : visibleSteps[0]?.id ?? 1;
  const activeStep = qualificationId ? safeStep : 1;
  const activeStepIndex = Math.max(
    0,
    visibleSteps.findIndex((step) => step.id === activeStep),
  );
  const lastStepId = visibleSteps[visibleSteps.length - 1]?.id ?? 1;
  const progressValue =
    visibleSteps.length > 0 ? ((activeStepIndex + 1) / visibleSteps.length) * 100 : 0;

  const activeStepDefinition =
    visibleSteps.find((step) => step.id === activeStep) ?? visibleSteps[0];

  const setStep = (nextStep: number) => {
    if (!qualificationId && nextStep > 1) {
      toast({
        title: "Save the main qualification first",
        description: "The remaining steps need a saved qualification record.",
      });
      return;
    }

    if (nextStep === 4 && !isSessionBased) {
      toast({
        title: "Sessions are not available",
        description: "Enable session-based delivery in Main Information first.",
      });
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("step", String(nextStep));

    if (nextStep === 4 && !nextParams.get("location")) {
      nextParams.delete("location");
    }

    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (qualificationId && safeStep !== requestedStep) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("step", String(safeStep));
      setSearchParams(nextParams, { replace: true });
    }
  }, [qualificationId, requestedStep, safeStep, searchParams, setSearchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeStep]);

  const stepStatus = (stepId: number) => {
    if (stepId === activeStep) return "active";
    if (activeStep > stepId) return "complete";
    if (stepId === 4 && !isSessionBased) return "locked";
    return "upcoming";
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/admin/qualifications")}
              className="h-9 w-fit rounded-lg px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Qualifications
            </Button>

            <div className="space-y-2">
              <Badge className="rounded-full bg-slate-900 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white hover:bg-slate-900">
                Qualification Wizard
              </Badge>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                {qualificationId ? "Edit Qualification" : "Create Qualification"}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">
                Keep the current feature set, but move the editor into a cleaner step-by-step flow.
                Every section still saves independently, and drafts are restored after refresh.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 lg:max-w-sm">
            <p className="font-medium text-slate-900">Draft-safe editing</p>
            <p className="mt-1 leading-6">
              In-progress values are stored locally, so reloading the page will not clear the form.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
            <span>Step {activeStepIndex + 1} of {visibleSteps.length}</span>
            <span>{Math.round(progressValue)}% complete</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {visibleSteps.map((step) => {
            const status = stepStatus(step.id);
            const isLocked = status === "locked";

            return (
              <Button
                key={step.id}
                type="button"
                variant={status === "active" ? "default" : "secondary"}
                onClick={() => setStep(step.id)}
                disabled={isLocked}
                className="rounded-xl"
              >
                {status === "complete" ? (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                ) : (
                  <Circle className="mr-2 h-4 w-4" />
                )}
                {step.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_340px]">
        <Card className="rounded-3xl border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.12em]">
                  {activeStepDefinition?.label}
                </Badge>
                <CardTitle className="text-xl text-slate-950">
                  {activeStepDefinition?.title}
                </CardTitle>
                <CardDescription className="max-w-2xl text-sm leading-6 text-slate-600">
                  {activeStepDefinition?.description}
                </CardDescription>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(Math.max(1, activeStep - 1))}
                  disabled={activeStep === 1}
                  className="rounded-xl"
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(Math.min(lastStepId, activeStep + 1))}
                  disabled={activeStep >= lastStepId}
                  className="rounded-xl"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {activeStep === 1 && <QualificationMain />}
            {activeStep === 2 && <QualificationDetails />}
            {activeStep === 3 && <QualificationPrice />}
            {activeStep === 4 && <QualificationSessions />}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-3xl border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-950">Step overview</CardTitle>
              <CardDescription>
                Jump to any completed step. Locked steps stay disabled until the prerequisite data exists.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {visibleSteps.map((step) => {
                const status = stepStatus(step.id);
                const isActive = status === "active";

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setStep(step.id)}
                    disabled={status === "locked"}
                    className={[
                      "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                      isActive ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:bg-slate-50",
                      status === "locked" ? "cursor-not-allowed opacity-60" : "",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        status === "complete"
                          ? "bg-emerald-100 text-emerald-700"
                          : isActive
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-500",
                      ].join(" ")}
                    >
                      {status === "complete" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : status === "locked" ? (
                        <LockKeyhole className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-semibold">{step.id}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-950">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-dashed border-slate-300 bg-slate-50 shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-950">UX notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-600">
              <p>Use the save button inside each step to validate that section before moving on.</p>
              <p>Main, details, pricing, and session drafts are persisted locally to survive refreshes.</p>
              <p>Session management only appears when the qualification is marked as session-based.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QualificationCreateOrEdit;
