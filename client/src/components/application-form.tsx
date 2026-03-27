import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Application } from "@/lib/api";
import { SOURCES, CONTRACT_TYPES, STATUS_CONFIG, FOLLOWUP_PRESETS } from "@/lib/constants";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Application>) => void;
  application?: Application | null;
}

const ACTIVE_STATUSES = ["applied", "followup", "interview", "offer"];

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function toInputDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toISOString().split("T")[0];
}

const emptyForm = {
  company: "",
  position: "",
  url: "",
  city: "",
  remote: false,
  contractType: "",
  source: "",
  status: "applied",
  salaryMin: "",
  salaryMax: "",
  tags: "",
  notes: "",
  contactName: "",
  contactRole: "",
  contactEmail: "",
  followupDate: addDays(7),
  followupPreset: "7" as string,
};

export function ApplicationForm({ open, onClose, onSubmit, application }: Props) {
  const [form, setForm] = useState(emptyForm);
  const isEditing = !!application;

  useEffect(() => {
    if (application) {
      setForm({
        company: application.company || "",
        position: application.position || "",
        url: application.url || "",
        city: application.location?.city || "",
        remote: application.location?.remote || false,
        contractType: application.contractType || "",
        source: application.source || "",
        status: application.status || "applied",
        salaryMin: application.salary?.min?.toString() || "",
        salaryMax: application.salary?.max?.toString() || "",
        tags: application.tags?.join(", ") || "",
        notes: application.notes || "",
        contactName: application.contacts?.[0]?.name || "",
        contactRole: application.contacts?.[0]?.role || "",
        contactEmail: application.contacts?.[0]?.email || "",
        followupDate: toInputDate(application.followupDate),
        followupPreset: "custom",
      });
    } else {
      setForm(emptyForm);
    }
  }, [application, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Partial<Application> = {
      company: form.company,
      position: form.position,
      url: form.url || undefined,
      location: { city: form.city || undefined, remote: form.remote },
      contractType: form.contractType || undefined,
      source: form.source || undefined,
      status: form.status,
      salary:
        form.salaryMin || form.salaryMax
          ? {
              min: form.salaryMin ? Number(form.salaryMin) : undefined,
              max: form.salaryMax ? Number(form.salaryMax) : undefined,
              currency: "EUR",
            }
          : undefined,
      tags: form.tags
        ? form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      notes: form.notes || undefined,
    };

    // Followup date pour les statuts actifs
    if (ACTIVE_STATUSES.includes(form.status) && form.followupDate) {
      data.followupDate = new Date(form.followupDate).toISOString();
    } else {
      data.followupDate = undefined;
    }

    // Contact
    if (form.contactName) {
      data.contacts = [
        {
          name: form.contactName,
          role: form.contactRole || undefined,
          email: form.contactEmail || undefined,
        },
      ];
    }

    // Nouvelle candidature avec statut actif
    if (!isEditing && ACTIVE_STATUSES.includes(form.status)) {
      data.appliedAt = new Date().toISOString();
      data.timeline = [
        { date: new Date().toISOString(), type: "applied", note: "Candidature envoyée" },
      ];
    }

    onSubmit(data);
    onClose();
  };

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectPreset = (days: number) => {
    setForm((prev) => ({
      ...prev,
      followupDate: addDays(days),
      followupPreset: days.toString(),
    }));
  };

  const showFollowup = ACTIVE_STATUSES.includes(form.status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la candidature" : "Nouvelle candidature"}
          </DialogTitle>
          <DialogDescription className="sr-only">Formulaire de candidature</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {/* Entreprise et poste */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Entreprise *</Label>
              <Input
                id="company"
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Poste *</Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) => update("position", e.target.value)}
                required
              />
            </div>
          </div>

          {/* URL offre */}
          <div className="space-y-2">
            <Label htmlFor="url">URL de l'offre</Label>
            <Input
              id="url"
              type="url"
              value={form.url}
              onChange={(e) => update("url", e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Localisation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div className="flex items-center gap-2 pt-8">
              <Switch
                id="remote"
                checked={form.remote}
                onCheckedChange={(v) => update("remote", v)}
              />
              <Label htmlFor="remote">Remote</Label>
            </div>
          </div>

          {/* Type contrat, source, statut */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Type de contrat</Label>
              <Select value={form.contractType} onValueChange={(v) => update("contractType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((ct) => (
                    <SelectItem key={ct} value={ct}>
                      {ct}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => update("source", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir" />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                    <SelectItem key={key} value={key}>
                      {conf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date de relance */}
          {showFollowup && (
            <div className="space-y-3 rounded-md border p-3">
              <Label className="text-sm font-medium">Date de relance</Label>
              <div className="flex gap-2 flex-wrap">
                {FOLLOWUP_PRESETS.map((preset) => (
                  <Button
                    key={preset.days}
                    type="button"
                    size="sm"
                    variant={form.followupPreset === preset.days.toString() ? "default" : "outline"}
                    onClick={() => selectPreset(preset.days)}
                  >
                    {preset.label}
                  </Button>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant={form.followupPreset === "custom" ? "default" : "outline"}
                  onClick={() => update("followupPreset", "custom")}
                >
                  Personnalisé
                </Button>
              </div>
              <Input
                type="date"
                value={form.followupDate}
                onChange={(e) => {
                  update("followupDate", e.target.value);
                  update("followupPreset", "custom");
                }}
              />
            </div>
          )}

          {/* Salaire */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Salaire min (€)</Label>
              <Input
                id="salaryMin"
                type="number"
                value={form.salaryMin}
                onChange={(e) => update("salaryMin", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaryMax">Salaire max (€)</Label>
              <Input
                id="salaryMax"
                type="number"
                value={form.salaryMax}
                onChange={(e) => update("salaryMax", e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={(e) => update("tags", e.target.value)}
              placeholder="remote, node.js, startup..."
            />
          </div>

          {/* Contact principal */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Contact principal</Label>
            <div className="grid grid-cols-3 gap-4">
              <Input
                placeholder="Nom"
                value={form.contactName}
                onChange={(e) => update("contactName", e.target.value)}
              />
              <Input
                placeholder="Rôle (ex: RH)"
                value={form.contactRole}
                onChange={(e) => update("contactRole", e.target.value)}
              />
              <Input
                placeholder="Email"
                type="email"
                value={form.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">{isEditing ? "Mettre à jour" : "Créer"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
