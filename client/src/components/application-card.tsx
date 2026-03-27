import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  MapPin,
  Calendar,
  ExternalLink,
  AlertTriangle,
  Trash2,
  Pencil,
  Clock,
  ChevronDown,
  Timer,
  X,
} from "lucide-react";
import { Application } from "@/lib/api";
import { STATUS_CONFIG, URGENCY_COLORS, getFollowupLabel } from "@/lib/constants";
import { CompanyLogo } from "@/components/company-logo";

interface Props {
  application: Application;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
  onAddEvent: (app: Application) => void;
  onReject: (app: Application) => void;
}

const TERMINAL_STATUSES = ["accepted", "rejected", "ghosted"];

export function ApplicationCard({ application, onEdit, onDelete, onAddEvent, onReject }: Props) {
  const [showNotes, setShowNotes] = useState(false);
  const statusConf = STATUS_CONFIG[application.status] || {
    label: application.status,
    color: "bg-gray-500",
  };
  const urgency = URGENCY_COLORS[application.urgencyColor || "none"] || URGENCY_COLORS.none;
  const isTerminal = TERMINAL_STATUSES.includes(application.status);

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const lastEvent = application.timeline?.length
    ? application.timeline[application.timeline.length - 1]
    : null;

  const followupLabel = getFollowupLabel(application.daysUntilFollowup);

  return (
    <Card
      className={`border-l-4 ${urgency.border} ${urgency.bg} bg-card/60 p-4 transition-all duration-200 hover:shadow-md animate-in fade-in-0 slide-in-from-bottom-2`}
    >
      {/* En-tête */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <CompanyLogo company={application.company} className="h-9 w-9 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base truncate">{application.company}</h3>
              {application.isOverdue && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
            </div>
            <p className="text-sm text-muted-foreground truncate">{application.position}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isTerminal && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs text-red-500 border-red-500/40 hover:text-red-600 hover:bg-red-500/10 hover:border-red-500"
              onClick={() => onReject(application)}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Refus
            </Button>
          )}

          <Badge variant="secondary" className={`${statusConf.color} text-white text-xs`}>
            {statusConf.label}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(application)}>
                <Pencil className="h-4 w-4 mr-2" /> Modifier
              </DropdownMenuItem>
              {!isTerminal && (
                <DropdownMenuItem onClick={() => onAddEvent(application)}>
                  <Clock className="h-4 w-4 mr-2" /> Ajouter un événement
                </DropdownMenuItem>
              )}
              {application.url && (
                <DropdownMenuItem onClick={() => window.open(application.url, "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" /> Voir l'offre
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => application._id && onDelete(application._id)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
        {application.location?.city && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {application.location.city}
            {application.location.remote && " (remote)"}
          </span>
        )}
        {application.appliedAt && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(application.appliedAt)}
          </span>
        )}
        {application.contractType && (
          <Badge variant="outline" className="text-xs">
            {application.contractType}
          </Badge>
        )}
        {application.source && (
          <Badge variant="outline" className="text-xs">
            {application.source}
          </Badge>
        )}
      </div>

      {/* Relance */}
      {followupLabel && (
        <div className="flex items-center gap-1.5 mt-2">
          <Timer
            className={`h-3.5 w-3.5 ${application.isOverdue ? "text-red-500" : "text-muted-foreground"}`}
          />
          <span
            className={`text-xs font-medium ${
              application.isOverdue
                ? "text-red-500"
                : application.daysUntilFollowup != null && application.daysUntilFollowup <= 2
                  ? "text-orange-500"
                  : "text-muted-foreground"
            }`}
          >
            Relance : {followupLabel}
            {application.followupDate && (
              <span className="font-normal text-muted-foreground ml-1">
                ({formatDate(application.followupDate)})
              </span>
            )}
          </span>
        </div>
      )}

      {/* Tags */}
      {application.tags && application.tags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {application.tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Dernier événement */}
      {lastEvent && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Dernier événement : {lastEvent.note || lastEvent.type}
            {" — "}
            {formatDate(lastEvent.date)}
          </p>
        </div>
      )}

      {/* Notes dépliables */}
      {application.notes && (
        <div className={`mt-3 ${!lastEvent ? "pt-3 border-t" : ""}`}>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${showNotes ? "rotate-180" : ""}`}
            />
            <span>{showNotes ? "Masquer les notes" : "Voir les notes"}</span>
          </button>

          <div
            className={`grid transition-all duration-200 ease-in-out ${showNotes ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}
          >
            <div className="overflow-hidden">
              <div className="rounded-md bg-muted/50 px-3 py-2">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {application.notes}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
