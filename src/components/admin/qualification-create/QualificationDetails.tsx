import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateQualificationDetailsMutation,
  useGetQualificationDetailsQuery,
  useUpdateQualificationDetailsMutation,
} from "@/redux/apis/qualification/qualificationDetailsApi";
import { useGetQualificationMainQuery } from "@/redux/apis/qualification/qualificationMainApi";
import { TryCatch } from "@/utils/apiTryCatch";
import { handleResponse } from "@/utils/handleResponse";

// ─── Zod Schema ────────────────────────────────────────────────────────────────

const qualificationDetailsSchema = z
  .object({
    description: z
      .string()
      .min(1, "Description is required")
      .max(2000, "Description must be under 2000 characters"),

    access_duration_months: z
      .number({ invalid_type_error: "Must be a number" })
      .int("Must be a whole number")
      .min(1, "Must be at least 1 month")
      .max(32767, "Exceeds maximum allowed value"),

    cpd_reference_number: z.string().optional(),

    cpd_hours: z
      .string()
      .regex(
        /^-?\d+(\.\d{1,2})?$/,
        "Must be a valid number (e.g. 1.5 or -0.74)",
      )
      .optional(),

    pass_mark: z
      .number({ invalid_type_error: "Must be a number" })
      .int("Must be a whole number")
      .min(0, "Pass mark cannot be negative")
      .max(100, "Pass mark cannot exceed 100"),

    retake_policy: z.string().min(1, "Retake policy is required"),

    certificate_provider: z.enum(["none", "prime_college", "awarding_body"], {
      required_error: "Please select a certificate provider",
    }),

    certificate_title_override: z.string().optional(),

    // Boolean flags
    cpd_branding_clean: z.boolean().default(false),
    accessibility_audit_passed: z.boolean().default(false),
    privacy_policy_required: z.boolean().default(false),
    requires_learner_declaration: z.boolean().default(false),
    requires_course_evaluation: z.boolean().default(false),
    issues_certificate: z.boolean().default(false),
  });

export type QualificationDetailsFormValues = z.infer<
  typeof qualificationDetailsSchema
>;

// ─── Default Values ─────────────────────────────────────────────────────────

const defaultValues: Partial<QualificationDetailsFormValues> = {
  description: "",
  access_duration_months: 12,
  cpd_reference_number: "",
  cpd_hours: "0",
  pass_mark: 70,
  retake_policy: "",
  certificate_provider: "none",
  certificate_title_override: "",
  cpd_branding_clean: false,
  accessibility_audit_passed: false,
  privacy_policy_required: false,
  requires_learner_declaration: false,
  requires_course_evaluation: false,
  issues_certificate: false,
};

// ─── Boolean Field Config ────────────────────────────────────────────────────

const booleanFields: {
  name: keyof QualificationDetailsFormValues;
  label: string;
  description: string;
}[] = [
  {
    name: "cpd_branding_clean",
    label: "CPD Branding Clean",
    description: "Removes CPD branding from learner-facing content",
  },
  {
    name: "accessibility_audit_passed",
    label: "Accessibility Audit Passed",
    description: "Confirms content has passed accessibility standards",
  },
  {
    name: "privacy_policy_required",
    label: "Privacy Policy Required",
    description: "Learners must accept the privacy policy before starting",
  },
  {
    name: "requires_learner_declaration",
    label: "Requires Learner Declaration",
    description: "Learners must submit a declaration upon completion",
  },
  {
    name: "requires_course_evaluation",
    label: "Requires Course Evaluation",
    description: "Learners must complete an evaluation after the course",
  },
  {
    name: "issues_certificate",
    label: "Issues Certificate",
    description: "A certificate will be issued upon successful completion",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

const QualificationDetails = () => {
  const { qualificationId } = useParams();
  const { toast } = useToast();

  const [createQualificationDetails] = useCreateQualificationDetailsMutation();
  const [updateQualificationDetails] = useUpdateQualificationDetailsMutation();
  const navigate = useNavigate();
  const { data } = useGetQualificationDetailsQuery(qualificationId, {
    skip: !qualificationId,
  });
  const { data: qualificationMainData } = useGetQualificationMainQuery(qualificationId, {
    skip: !qualificationId,
  });
  const isEditMode = Boolean(data?.data);
  const isCpd =
    qualificationMainData?.data?.qualification_type_detail?.slug === "cpd";

  const form = useForm<QualificationDetailsFormValues>({
    resolver: zodResolver(qualificationDetailsSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const issuesCertificate = watch("issues_certificate");

  // ── Populate form in edit mode ──────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && data?.data) {
      form.reset(data?.data);
    }
  }, [isEditMode, data?.data, form]);

  useEffect(() => {
    if (!isCpd) {
      setValue("cpd_reference_number", "");
      setValue("cpd_hours", "0");
      setValue("cpd_branding_clean", false);
    }
  }, [isCpd, setValue]);

  // ── Submit ──────────────────────────────────────────────────────────────
  const onSubmit = async (values: QualificationDetailsFormValues) => {
    const payload = {
      ...values,
      cpd_reference_number: isCpd ? values.cpd_reference_number || "" : "",
      cpd_hours: isCpd ? values.cpd_hours || "0" : "0",
      cpd_branding_clean: isCpd ? values.cpd_branding_clean : false,
    };

    if (isEditMode) {
      const [data, error] = await TryCatch(
        updateQualificationDetails({
          id: qualificationId,
          payload,
        }).unwrap(),
      );

      const result = handleResponse({
        data,
        error,
        successMessage: "Qualification updated successfully",
      });

      toast({
        title: result.type === "success" ? "Success" : "Error",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      });
      toast({ title: "Qualification updated successfully" });
    } else {
      const [data, error] = await TryCatch(
        createQualificationDetails({ id: qualificationId, payload }).unwrap(),
      );

      const result = handleResponse({
        data,
        error,
        successMessage: "Qualification main create Successfully",
      });

      toast({
        title: result.type === "success" ? "Success" : "Error",
        description: result.message,
        variant: result.type === "error" ? "destructive" : "default",
      });

      if (result.type === "success")
        navigate(`/admin/qualifications/${qualificationId}/edit?step=3`);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Basic Info ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Description – full width */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter qualification description…"
                        className="min-h-[100px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Access Duration */}
            <FormField
              control={form.control}
              name="access_duration_months"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Duration (months)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 12"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CPD Reference Number */}
            {isCpd ? (
              <FormField
                control={form.control}
                name="cpd_reference_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPD Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CPD-2024-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                CPD-only fields appear here when the qualification type is set to CPD.
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── CPD & Assessment ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              CPD &amp; Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CPD Hours */}
            {isCpd ? (
              <FormField
                control={form.control}
                name="cpd_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPD Hours</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1.5" {...field} />
                    </FormControl>
                    <FormDescription>
                      Total CPD hours awarded for this qualification.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Assessment rules apply to all qualifications. CPD hours are hidden for non-CPD types.
              </div>
            )}

            {/* Pass Mark */}
            <FormField
              control={form.control}
              name="pass_mark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pass Mark (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 70"
                      min={0}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Retake Policy – full width */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="retake_policy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retake Policy</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the retake policy…"
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Certificate ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Certificate Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Certificate Provider */}
            <FormField
              control={form.control}
              name="certificate_provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Provider</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Certificate</SelectItem>
                      <SelectItem value="prime_college">
                        Prime College
                      </SelectItem>
                      <SelectItem value="awarding_body">
                        Awarding Body
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Certificate Title Override */}
            <FormField
              control={form.control}
              name="certificate_title_override"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Title Override</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Leave blank to use default title"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Overrides the default certificate title if provided
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Flags / Toggles ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Options &amp; Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {booleanFields.map((item, index) => (
              <div key={item.name}>
                <FormField
                  control={form.control}
                  name={item.name}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          {item.label}
                        </FormLabel>
                        <FormDescription>{item.description}</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Submit ── */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-36">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting
              ? isEditMode
                ? "Updating…"
                : "Creating…"
              : isEditMode
                ? "Update Details"
                : "Save & Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QualificationDetails;
