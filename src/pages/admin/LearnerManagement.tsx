/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Search, ArrowLeft, UserPlus, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TablePagination from "@/components/admin/TablePagination";
import LearnerDetailModal from "@/components/admin/LearnerDetailModal";
import { type AdminLearner } from "@/data/adminMockData";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetEnrolledLearnersQuery } from "@/redux/apis/admin/learnerManagementApi";
import EnrollLearnerModal from "@/components/admin/learnerManagement/EnrollLearnerModal";

const ITEMS_PER_PAGE = 10;
// TODO: need to work here for create enrollment and view details modal
const LearnerManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLearner, setSelectedLearner] = useState<AdminLearner | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const queryParams = {
    search: debouncedSearch?.trim() || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  };

  const {
    data: enrolledLearnersResponse,
    isLoading,
    isFetching,
    error,
  } = useGetEnrolledLearnersQuery(queryParams);

  const learners = enrolledLearnersResponse?.data?.results || [];
  const totalItems = enrolledLearnersResponse?.data?.count || 0;

  const handleLearnerUpdate = (updated: AdminLearner) => {
    setSelectedLearner(updated);
  };

  const paymentBadge = (status: string) => {
    const map: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive",
    };

    return (
      <Badge variant={map[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const statusBadge = (status: string) => {
    const variant =
      status === "active"
        ? "default"
        : status === "completed"
          ? "secondary"
          : "destructive";

    return (
      <Badge variant={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const mapLearnerForModal = (l: any): AdminLearner =>
    ({
      id: l.id,
      name: l.learner.name,
      learnerId: l.learner.learner_id,
      email: l.learner.email,
      qualification: l.qualification.title,
      assignedTrainer: l.trainer?.name || "Unassigned",
      progress: l.progress.progress_percent,
      paymentStatus: l.payment.status,
      status: l.status,
    }) as AdminLearner;

  if (error) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-destructive font-medium mb-2">
              Failed to load learners
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error loading enrolled learners.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Learner Management</h1>
          <p className="text-sm text-muted-foreground">
            Enrol, manage, and monitor learners
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1" /> Enrol Learner
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search learners..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead className="hidden md:table-cell">
                  Qualification
                </TableHead>
                <TableHead className="hidden lg:table-cell">Trainer</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="hidden md:table-cell">Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Loading learners...
                  </TableCell>
                </TableRow>
              ) : learners.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No learners found.
                  </TableCell>
                </TableRow>
              ) : (
                learners.map((l: any) => (
                  <TableRow
                    key={l.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedLearner(mapLearnerForModal(l));
                      setDetailOpen(true);
                    }}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{l.learner.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.learner.learner_id} • {l.learner.email}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-sm max-w-[200px] truncate">
                      {l.qualification.title}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-sm">
                      {l.trainer?.name || "Unassigned"}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={l.progress.progress_percent}
                          className="w-16 h-2"
                        />
                        <span className="text-xs text-muted-foreground">
                          {l.progress.progress_percent}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {paymentBadge(l.payment.status)}
                    </TableCell>

                    <TableCell>{statusBadge(l.status)}</TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLearner(mapLearnerForModal(l));
                          setDetailOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      <LearnerDetailModal
        learner={selectedLearner}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={handleLearnerUpdate}
      />

      <EnrollLearnerModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};

export default LearnerManagement;
