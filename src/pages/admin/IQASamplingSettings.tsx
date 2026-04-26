import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useCreateCourseSamplingPlanMutation,
  useGetChecklistQualificationOptionsQuery,
  useGetCourseSamplingPlansQuery,
  useGetIqaSamplingConfigQuery,
  useUpdateCourseSamplingPlanMutation,
  useUpdateIqaSamplingConfigMutation,
} from "@/redux/apis/iqa/iqaApi";
import type {
  ChecklistQualificationOption,
  CourseSamplingPlanItem,
  IQASamplingConfig,
} from "@/types/iqa.types";

const toArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.results)) return record.results as T[];
    if (record.data !== undefined) {
      if (Array.isArray(record.data)) return record.data as T[];
      if (typeof record.data === "object" && record.data !== null) {
        const data = record.data as Record<string, unknown>;
        if (Array.isArray(data.results)) return data.results as T[];
        if (Array.isArray(data.items)) return data.items as T[];
      }
    }
    if (Array.isArray(record.items)) return record.items as T[];
  }
  return [];
};

const IQASamplingSettings = () => {
  const { toast } = useToast();
  const {
    data: configResponse,
    isLoading: isLoadingConfig,
    isError: isConfigError,
  } = useGetIqaSamplingConfigQuery();
  const {
    data: plansResponse,
    isLoading: isLoadingPlans,
    isError: isPlansError,
  } = useGetCourseSamplingPlansQuery();
  const {
    data: qualificationsResponse,
    isLoading: isLoadingQualifications,
  } = useGetChecklistQualificationOptionsQuery();

  const [updateSamplingConfig, { isLoading: isSavingConfig }] =
    useUpdateIqaSamplingConfigMutation();
  const [createCourseSamplingPlan, { isLoading: isCreatingPlan }] =
    useCreateCourseSamplingPlanMutation();
  const [updateCourseSamplingPlan, { isLoading: isUpdatingPlan }] =
    useUpdateCourseSamplingPlanMutation();

  const [globalConfig, setGlobalConfig] = useState<IQASamplingConfig | null>(null);
  const [selectedQualificationId, setSelectedQualificationId] = useState("");
  const [newPlanPercentage, setNewPlanPercentage] = useState(25);
  const [newPlanSampleAll, setNewPlanSampleAll] = useState(false);

  useEffect(() => {
    if (configResponse) {
      setGlobalConfig(configResponse);
    }
  }, [configResponse]);

  const plans = useMemo<CourseSamplingPlanItem[]>(() => toArray<CourseSamplingPlanItem>(plansResponse), [plansResponse]);
  const qualifications = useMemo<ChecklistQualificationOption[]>(
    () => toArray<ChecklistQualificationOption>(qualificationsResponse),
    [qualificationsResponse],
  );
  const qualificationOptions = useMemo(
    () => qualifications.filter((item) => !plans.some((plan) => plan.qualification.id === item.id)),
    [plans, qualifications],
  );

  const handleSaveGlobalConfig = async () => {
    if (!globalConfig) return;
    try {
      await updateSamplingConfig({
        random_percentage: globalConfig.random_percentage,
        new_trainer_percentage: globalConfig.new_trainer_percentage,
        resubmission_always_sampled: globalConfig.resubmission_always_sampled,
        escalation_always_sampled: globalConfig.escalation_always_sampled,
        audit_window_months: globalConfig.audit_window_months,
      }).unwrap();
      toast({ title: "Sampling configuration updated" });
    } catch {
      toast({ title: "Failed to update sampling configuration", variant: "destructive" });
    }
  };

  const handleCreatePlan = async () => {
    if (!selectedQualificationId) {
      toast({ title: "Please select a qualification", variant: "destructive" });
      return;
    }
    try {
      await createCourseSamplingPlan({
        qualification_id: selectedQualificationId,
        sampling_rate_percent: newPlanSampleAll ? 100 : newPlanPercentage,
        sample_all: newPlanSampleAll,
      }).unwrap();
      setSelectedQualificationId("");
      setNewPlanPercentage(25);
      setNewPlanSampleAll(false);
      toast({ title: "Course sampling plan created" });
    } catch {
      toast({ title: "Failed to create course sampling plan", variant: "destructive" });
    }
  };

  const handlePlanUpdate = async (
    qualificationId: string,
    body: { sampling_rate_percent?: number; sample_all?: boolean },
  ) => {
    try {
      await updateCourseSamplingPlan({ qualificationId, body }).unwrap();
      toast({ title: "Course sampling plan updated" });
    } catch {
      toast({ title: "Failed to update course sampling plan", variant: "destructive" });
    }
  };

  if (isLoadingConfig || isLoadingPlans || isLoadingQualifications || !globalConfig) {
    return <div className="py-20 text-center text-muted-foreground">Loading sampling settings...</div>;
  }

  if (isConfigError || isPlansError) {
    return <div className="py-20 text-center text-muted-foreground">Failed to load sampling settings.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/iqa" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to IQA Management
      </Link>

      <div>
        <h1 className="text-2xl font-bold">IQA Sampling Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Manage the live IQA sampling rules and qualification-specific override rates
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Global Sampling Rules</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label>Random sampling rate: <strong>{globalConfig.random_percentage}%</strong></Label>
            <Slider
              value={[globalConfig.random_percentage]}
              onValueChange={([value]) =>
                setGlobalConfig((prev) => prev ? { ...prev, random_percentage: value } : prev)
              }
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>New trainer sampling rate: <strong>{globalConfig.new_trainer_percentage}%</strong></Label>
            <Slider
              value={[globalConfig.new_trainer_percentage]}
              onValueChange={([value]) =>
                setGlobalConfig((prev) => prev ? { ...prev, new_trainer_percentage: value } : prev)
              }
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Audit window: <strong>{globalConfig.audit_window_months} months</strong></Label>
            <Slider
              value={[globalConfig.audit_window_months]}
              onValueChange={([value]) =>
                setGlobalConfig((prev) => prev ? { ...prev, audit_window_months: value } : prev)
              }
              min={1}
              max={24}
              step={1}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Always sample resubmissions</p>
              <p className="text-xs text-muted-foreground">
                Force IQA review when a unit is signed off again after resubmission.
              </p>
            </div>
            <Switch
              checked={globalConfig.resubmission_always_sampled}
              onCheckedChange={(checked) =>
                setGlobalConfig((prev) => prev ? { ...prev, resubmission_always_sampled: checked } : prev)
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Always sample escalations</p>
              <p className="text-xs text-muted-foreground">
                Force IQA review when trainer or learner escalation flags apply.
              </p>
            </div>
            <Switch
              checked={globalConfig.escalation_always_sampled}
              onCheckedChange={(checked) =>
                setGlobalConfig((prev) => prev ? { ...prev, escalation_always_sampled: checked } : prev)
              }
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button onClick={handleSaveGlobalConfig} disabled={isSavingConfig}>
              {isSavingConfig ? "Saving..." : "Save Global Rules"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add Qualification Override</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <Label>Qualification</Label>
            <Select value={selectedQualificationId} onValueChange={setSelectedQualificationId}>
              <SelectTrigger>
                <SelectValue placeholder="Select qualification" />
              </SelectTrigger>
              <SelectContent>
                {qualificationOptions.map((qualification) => (
                  <SelectItem key={qualification.id} value={qualification.id}>
                    {qualification.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>
              Qualification sampling rate:{" "}
              <strong>{newPlanSampleAll ? 100 : newPlanPercentage}%</strong>
            </Label>
            <Slider
              value={[newPlanSampleAll ? 100 : newPlanPercentage]}
              onValueChange={([value]) => setNewPlanPercentage(value)}
              min={0}
              max={100}
              step={5}
              disabled={newPlanSampleAll}
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Sample all units for this qualification</p>
              <p className="text-xs text-muted-foreground">
                Enable 100% IQA review for every trainer sign-off on this course.
              </p>
            </div>
            <Switch checked={newPlanSampleAll} onCheckedChange={setNewPlanSampleAll} />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button onClick={handleCreatePlan} disabled={isCreatingPlan}>
              {isCreatingPlan ? "Creating..." : "Create Override"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {plans.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No qualification-specific overrides are configured yet.
            </CardContent>
          </Card>
        ) : (
          plans.map((plan) => (
            <Card key={plan.qualification.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{plan.qualification.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>
                    Sampling rate:{" "}
                    <strong>{plan.sample_all ? 100 : plan.sampling_rate_percent}%</strong>
                  </Label>
                  <Slider
                    value={[plan.sample_all ? 100 : plan.sampling_rate_percent]}
                    onValueChange={([value]) =>
                      handlePlanUpdate(plan.qualification.id, { sampling_rate_percent: value })
                    }
                    min={0}
                    max={100}
                    step={5}
                    disabled={isUpdatingPlan || plan.sample_all}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">Sample all</p>
                    <p className="text-xs text-muted-foreground">
                      Created by {plan.created_by.name}
                    </p>
                  </div>
                  <Switch
                    checked={plan.sample_all}
                    onCheckedChange={(checked) =>
                      handlePlanUpdate(plan.qualification.id, {
                        sample_all: checked,
                        sampling_rate_percent: checked ? 100 : plan.sampling_rate_percent,
                      })
                    }
                    disabled={isUpdatingPlan}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default IQASamplingSettings;
