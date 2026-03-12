import { useParams, Link } from "react-router-dom";
import { ArrowLeft, GraduationCap, Users, Calendar, Banknote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { adminQualifications } from "@/data/adminMockData";
import UnitAssessmentConfig from "@/components/trainer/UnitAssessmentConfig";

const QualificationDetail = () => {
  const { qualificationId } = useParams();
  const qualification = adminQualifications.find((q) => q.id === qualificationId);

  if (!qualification) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Qualification not found.</p>
        <Link to="/admin/qualifications" className="text-primary underline mt-2 inline-block">Back to Qualifications</Link>
      </div>
    );
  }

  const statusMap = { active: "default", draft: "secondary", archived: "outline" } as const;

  return (
    <div className="space-y-6">
      <Link to="/admin/qualifications" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Qualifications
      </Link>

      {/* Header */}
      <Card className="bg-primary text-primary-foreground p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-primary-foreground/70 text-sm mb-1">{qualification.code} • {qualification.awardingBody}</p>
            <h1 className="text-2xl font-bold">{qualification.title}</h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-primary-foreground/80">
              <span className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {qualification.level}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {qualification.enrolledLearners} learners</span>
              <span className="flex items-center gap-1"><Banknote className="w-4 h-4" /> £{qualification.price.toLocaleString()}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {qualification.accessDuration}</span>
            </div>
          </div>
          <Badge variant={statusMap[qualification.status]} className="text-xs">
            {qualification.status.charAt(0).toUpperCase() + qualification.status.slice(1)}
          </Badge>
        </div>
      </Card>

      {/* Units with Assessment Config */}
      <div>
        <h2 className="text-lg font-bold text-foreground mb-1">Unit Assessment Requirements</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Configure which assessment types (quiz, written, evidence) are required for each unit. These settings apply to all learners.
        </p>
        <Separator className="mb-4" />

        {qualification.units && qualification.units.length > 0 ? (
          <div className="space-y-3">
            {qualification.units.map((unit) => (
              <UnitAssessmentConfig
                key={unit.code}
                unitCode={unit.code}
                unitName={unit.name}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No units defined for this qualification yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QualificationDetail;
