import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Application } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, reason: string) => void;
  application: Application | null;
}

export function RejectDialog({ open, onClose, onSubmit, application }: Props) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!application?._id) return;

    onSubmit(application._id, reason);
    setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Refus — {application?.company}</DialogTitle>
          <DialogDescription className="sr-only">
            Marquer cette candidature comme refusée
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Raison du refus</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Profil pas assez senior, pas de retour après entretien..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" variant="destructive">
              Marquer comme refusé
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
