import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, CalendarPlus, AlertTriangle } from "lucide-react";
import { learnerQualifications } from "@/data/learnerMockData";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ExtensionRequestModal from "@/components/learner/ExtensionRequestModal";

// Mock qualification-level expiry data (DD/MM/YYYY)
const qualificationExpiry: Record<string, string> = {
  "adult-care-l4": "01/02/2026", // expired
  "business-admin-l3": "15/09/2026", // still active
};

const isExpired = (dateStr: string) => {
  const [d, m, y] = dateStr.split("/").map(Number);
  return new Date(y, m - 1, d) < new Date();
};

const daysOverdue = (dateStr: string) => {
  const [d, m, y] = dateStr.split("/").map(Number);
  const diff = new Date().getTime() - new Date(y, m - 1, d).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const MyQualifications = () => {
  const [extensionOpen, setExtensionOpen] = useState(false);
  const [extensionQual, setExtensionQual] = useState<{ title: string; expiry: string } | null>(null);

  const openExtension = (title: string, expiry: string) => {
    setExtensionQual({ title, expiry });
    setExtensionOpen(true);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">My Qualifications</h1>
      <p className="text-muted-foreground mb-8">View and manage your enrolled qualifications</p>

      <div className="space-y-6">
        {learnerQualifications.map((q) => {
          const completed = q.units.filter((u) => u.status === "competent").length;
          const total = q.units.length;
          const pct = Math.round((completed / total) * 100);
          const expiry = qualificationExpiry[q.id];
          const expired = expiry ? isExpired(expiry) : false;
          const overdueDays = expiry && expired ? daysOverdue(expiry) : 0;

          return (
            <div key={q.id} className={`bg-card border rounded-xl p-6 ${expired ? "border-destructive/40" : "border-border"}`}>
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-xl font-bold text-foreground">{q.title}</h3>
                    <span className={`${q.categoryColor} text-white text-xs font-bold px-2.5 py-0.5 rounded`}>
                      {q.category}
                    </span>
                    {expired ? (
                      <Badge variant="destructive" className="text-xs">Expired</Badge>
                    ) : (
                      <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2.5 py-0.5 rounded">
                        In Progress
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Qualification Code: {q.code}</p>
                  <p className="text-sm text-muted-foreground">Enrolled: {q.enrolledDate}</p>
                  {expiry && (
                    <p className={`text-sm ${expired ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      Access {expired ? "expired" : "expires"}: {expiry}
                    </p>
                  )}
                </div>
                <Link
                  to={`/learner/qualification/${q.id}`}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0"
                >
                  <Eye className="w-5 h-5 text-secondary-foreground" />
                </Link>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Overall Progress</span>
                  <span className="text-sm font-semibold text-primary">
                    {completed} of {total} Units Complete ({pct}%)
                  </span>
                </div>
                <Progress value={pct} className="h-3" />
              </div>

              {/* Expired Qualification — Extension CTA */}
              {expired && (
                <div className="mt-4 border border-destructive/30 bg-destructive/5 rounded-lg p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-destructive">Qualification access expired</p>
                      <p className="text-xs text-muted-foreground">
                        Overdue by {overdueDays} day{overdueDays !== 1 ? "s" : ""} — extend to continue your studies
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5 flex-shrink-0"
                    onClick={() => openExtension(q.title, expiry)}
                  >
                    <CalendarPlus className="w-3.5 h-3.5" /> Extend & Pay
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {extensionQual && (
        <ExtensionRequestModal
          open={extensionOpen}
          onOpenChange={setExtensionOpen}
          qualificationTitle={extensionQual.title}
          currentExpiry={extensionQual.expiry}
        />
      )}
    </div>
  );
};

export default MyQualifications;
