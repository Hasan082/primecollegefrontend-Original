import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, CheckCircle2, ShieldCheck, MinusCircle,
  ChevronDown, ChevronUp, Eye, X,
} from "lucide-react";
import {
  loadIQANotifications,
  markNotificationRead,
  markNotificationResolved,
  type IQANotification,
} from "@/lib/iqaNotifications";

const IQANotificationsPanel = () => {
  const [notifications, setNotifications] = useState<IQANotification[]>(() => loadIQANotifications());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = () => setNotifications(loadIQANotifications());

  const actionRequired = notifications.filter(n => n.type === "iqa_action_required" && !n.resolved);
  const approvals = notifications.filter(n => n.type === "iqa_approved");
  const allNotifications = [...actionRequired, ...approvals.slice(0, 3)];

  if (allNotifications.length === 0) return null;

  const handleRead = (id: string) => {
    markNotificationRead(id);
    refresh();
  };

  const handleResolve = (id: string) => {
    markNotificationResolved(id);
    refresh();
  };

  const typeConfig = {
    iqa_action_required: {
      icon: AlertTriangle,
      label: "IQA Action Required",
      borderClass: "border-l-4 border-l-destructive",
      badgeClass: "bg-destructive text-destructive-foreground",
    },
    iqa_approved: {
      icon: ShieldCheck,
      label: "IQA Approved",
      borderClass: "border-l-4 border-l-green-500",
      badgeClass: "bg-green-600 text-white",
    },
    iqa_not_sampled: {
      icon: MinusCircle,
      label: "Not Sampled",
      borderClass: "border-l-4 border-l-muted-foreground",
      badgeClass: "bg-muted text-muted-foreground",
    },
  };

  return (
    <Card className="p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">IQA Notifications</h3>
          {actionRequired.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {actionRequired.length} Action{actionRequired.length !== 1 ? "s" : ""} Required
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {allNotifications.map((n) => {
          const config = typeConfig[n.type];
          const Icon = config.icon;
          const isExpanded = expandedId === n.id;

          return (
            <div
              key={n.id}
              className={`rounded-lg border bg-card overflow-hidden ${config.borderClass} ${
                !n.read ? "ring-1 ring-primary/20" : ""
              }`}
            >
              {/* Header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => {
                  setExpandedId(isExpanded ? null : n.id);
                  if (!n.read) handleRead(n.id);
                }}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${
                  n.type === "iqa_action_required" ? "text-destructive" : "text-green-600"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {n.unitName}
                    </span>
                    <Badge className={`text-[10px] ${config.badgeClass}`}>{config.label}</Badge>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {n.learnerName} • {n.qualification} • {n.createdDate}
                  </p>
                </div>
                {n.type === "iqa_action_required" && n.actionLabel && (
                  <Badge variant="outline" className="text-xs border-destructive text-destructive flex-shrink-0">
                    {n.actionLabel}
                  </Badge>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-0 border-t border-border">
                  <div className="pt-3 space-y-3">
                    {/* IQA Comments */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        IQA Feedback from {n.iqaName}
                      </p>
                      <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground leading-relaxed whitespace-pre-line">
                        {n.iqaComments || "No comments provided."}
                      </div>
                    </div>

                    {/* Reason (disagree only) */}
                    {n.reason && (
                      <div>
                        <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-1">
                          Reason for Disagreement
                        </p>
                        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-sm text-foreground leading-relaxed">
                          {n.reason}
                        </div>
                      </div>
                    )}

                    {/* Affected Criteria */}
                    {n.affectedCriteria && n.affectedCriteria.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                          Affected Criteria
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {n.affectedCriteria.map((c, i) => (
                            <Badge key={i} variant="outline" className="text-xs border-destructive/50 text-destructive">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    {n.type === "iqa_action_required" && !n.resolved && (
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1.5 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolve(n.id);
                          }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Resolved
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRead(n.id);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" /> Acknowledge
                        </Button>
                      </div>
                    )}

                    {n.resolved && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default IQANotificationsPanel;
