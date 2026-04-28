import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetSignoffsQuery } from "@/redux/apis/iqa/iqaApi";
import TablePagination from "@/components/admin/TablePagination";

const ITEMS_PER_PAGE = 20;

const reviewStatusVariant = (
  status: string,
): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "approved") return "default";
  if (status === "action_required") return "destructive";
  if (status === "escalated") return "destructive";
  if (status === "pending" || status === "in_progress") return "secondary";
  return "outline";
};

const reviewStatusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  approved: "Approved",
  action_required: "Action Required",
  escalated: "Escalated",
  auto_cleared: "Auto-Cleared",
};

const IQASignoffs = () => {
  const [page, setPage] = useState(1);
  const [enrolmentFilter, setEnrolmentFilter] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("");
  const [resubmissionOnly, setResubmissionOnly] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<{
    enrolment: string;
    trainer: string;
    had_resubmission: string;
  }>({ enrolment: "", trainer: "", had_resubmission: "" });

  const { data, isLoading, isError, isFetching } = useGetSignoffsQuery({
    ...appliedFilters,
    page,
    page_size: ITEMS_PER_PAGE,
  });

  const results = data?.results ?? [];
  const totalItems = data?.count ?? 0;

  const handleApply = () => {
    setPage(1);
    setAppliedFilters({
      enrolment: enrolmentFilter.trim(),
      trainer: trainerFilter.trim(),
      had_resubmission: resubmissionOnly ? "true" : "",
    });
  };

  const handleClear = () => {
    setEnrolmentFilter("");
    setTrainerFilter("");
    setResubmissionOnly(false);
    setPage(1);
    setAppliedFilters({ enrolment: "", trainer: "", had_resubmission: "" });
  };

  return (
    <div className="space-y-6">
      <Link
        to="/admin/iqa"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to IQA Management
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Unit Sign-Offs</h1>
        <p className="text-sm text-muted-foreground">
          Audit trail of all trainer unit sign-offs and their IQA sampling outcomes
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Enrolment ID</Label>
            <Input
              placeholder="Paste enrolment UUID…"
              value={enrolmentFilter}
              onChange={(e) => setEnrolmentFilter(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Trainer ID</Label>
            <Input
              placeholder="Paste trainer UUID…"
              value={trainerFilter}
              onChange={(e) => setTrainerFilter(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="resubmission-filter"
                checked={resubmissionOnly}
                onCheckedChange={setResubmissionOnly}
              />
              <Label htmlFor="resubmission-filter" className="cursor-pointer">
                Resubmissions only
              </Label>
            </div>
          </div>
          <div className="md:col-span-3 flex gap-2">
            <Button onClick={handleApply} size="sm" className="gap-1.5">
              <Search className="w-3.5 h-3.5" /> Apply
            </Button>
            <Button onClick={handleClear} size="sm" variant="outline">
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Sign-Offs {totalItems > 0 && `(${totalItems})`}
            </CardTitle>
            {isFetching && (
              <span className="text-xs text-muted-foreground">Refreshing…</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">
              Loading sign-offs…
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-muted-foreground">
              Failed to load sign-offs.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unit</TableHead>
                    <TableHead>Signed Off By</TableHead>
                    <TableHead className="text-center">Resubmission</TableHead>
                    <TableHead>Signed Off At</TableHead>
                    <TableHead>IQA Decision</TableHead>
                    <TableHead>IQA Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        No sign-offs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    results.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <p className="font-medium text-sm">
                            {item.unit.code}: {item.unit.title}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.signed_off_by.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.had_resubmission_cycle ? (
                            <Badge variant="secondary" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.signed_off_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {item.iqa_sample ? (
                            <Badge variant="outline" className="text-xs">
                              {item.iqa_sample.sampling_decision === "sampled"
                                ? "Sampled"
                                : "Not Sampled"}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.iqa_sample ? (
                            <Badge
                              variant={reviewStatusVariant(
                                item.iqa_sample.review_status,
                              )}
                              className="text-xs"
                            >
                              {reviewStatusLabel[item.iqa_sample.review_status] ??
                                item.iqa_sample.review_status}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                currentPage={page}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IQASignoffs;
