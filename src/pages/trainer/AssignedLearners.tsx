import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trainerLearners } from "@/data/trainerMockData";

const AssignedLearners = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">Assigned Learners</h1>
      <p className="text-muted-foreground mb-8">View all learners under your assessment</p>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Learner</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Units</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trainerLearners.map((l) => (
              <TableRow key={l.id}>
                <TableCell className="font-medium text-primary">{l.name}</TableCell>
                <TableCell className="text-sm">{l.learnerId}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{l.email}</TableCell>
                <TableCell>
                  <div className="text-sm">{l.qualification}</div>
                  <Badge className="bg-primary text-primary-foreground text-[10px] mt-0.5">{l.qualificationCategory}</Badge>
                </TableCell>
                <TableCell className="text-sm">{l.enrolledDate}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${l.progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{l.progress}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{l.unitsCompleted}/{l.totalUnits}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AssignedLearners;
