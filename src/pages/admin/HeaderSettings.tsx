import { Link } from "react-router-dom";
import { ArrowLeft, PanelTop } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const HeaderSettings = () => {
  return (
    <div className="space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <PanelTop className="h-6 w-6 text-primary" /> Header Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your global header appearance and links
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Header customization options will go here.
        </CardContent>
      </Card>
    </div>
  );
};

export default HeaderSettings;
