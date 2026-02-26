import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { recentAssessments } from "@/data/trainerMockData";

const outcomeColors: Record<string, string> = {
  "Competent": "bg-green-100 text-green-800",
  "Resubmission Required": "bg-secondary/20 text-secondary-foreground",
  "Not Yet Competent": "bg-destructive/10 text-destructive",
};

const AssessmentHistory = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">Assessment History</h1>
      <p className="text-muted-foreground mb-8">View your past assessment decisions</p>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Learner</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Outcome</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentAssessments.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.learnerName}</TableCell>
                <TableCell className="text-sm">{a.unitTitle}</TableCell>
                <TableCell className="text-sm">{a.assessedDate}</TableCell>
                <TableCell>
                  <Badge className={outcomeColors[a.outcome]}>{a.outcome}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AssessmentHistory;
