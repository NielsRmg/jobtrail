import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { ApplicationCard } from "@/components/application-card";
import { ApplicationForm } from "@/components/application-form";
import { TimelineDialog } from "@/components/timeline-dialog";
import { RejectDialog } from "@/components/reject-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { api, Application } from "@/lib/api";
import { SOURCES, TABS } from "@/lib/constants";
import { useDebounce } from "@/lib/hooks";
import { Plus, Search, AlertTriangle, Briefcase } from "lucide-react";

function App() {
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [alerts, setAlerts] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  // Filtres
  const [activeTab, setActiveTab] = useState<string>("active");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 150);

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineApp, setTimelineApp] = useState<Application | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectApp, setRejectApp] = useState<Application | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const fetchApplications = useCallback(async () => {
    try {
      if (initialLoad) setLoading(true);
      const params: { source?: string; search?: string } = {};
      if (sourceFilter !== "all") params.source = sourceFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const [apps, alertList] = await Promise.all([api.getAll(params), api.getAlerts()]);
      setAllApplications(apps);
      setAlerts(alertList);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [sourceFilter, debouncedSearch, initialLoad]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Filtrage par onglet + tri par urgence
  const filteredApplications = useMemo(() => {
    const currentTab = TABS.find((t) => t.value === activeTab);
    if (!currentTab) return allApplications;

    const filtered = allApplications.filter((app) =>
      (currentTab.statuses as readonly string[]).includes(app.status),
    );

    if (activeTab === "active") {
      return filtered.sort((a, b) => {
        const scoreA = a.urgencyScore ?? 9999;
        const scoreB = b.urgencyScore ?? 9999;
        return scoreA - scoreB;
      });
    }

    return filtered;
  }, [allApplications, activeTab]);

  // Compteurs par onglet
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tab of TABS) {
      counts[tab.value] = allApplications.filter((app) =>
        (tab.statuses as readonly string[]).includes(app.status),
      ).length;
    }
    return counts;
  }, [allApplications]);

  const handleCreate = async (data: Partial<Application>) => {
    try {
      await api.create(data);
      fetchApplications();
    } catch (error) {
      console.error("Erreur création:", error);
    }
  };

  const handleUpdate = async (data: Partial<Application>) => {
    if (!editingApp?._id) return;
    try {
      await api.update(editingApp._id, data);
      setEditingApp(null);
      fetchApplications();
    } catch (error) {
      console.error("Erreur mise à jour:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.remove(deleteId);
      fetchApplications();
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const openDelete = (id: string, company: string) => {
    setDeleteId(id);
    setDeleteName(company);
    setDeleteOpen(true);
  };

  const handleAddEvent = async (
    id: string,
    event: { type: string; note?: string; date: string },
  ) => {
    try {
      await api.addTimelineEvent(id, event);
      fetchApplications();
    } catch (error) {
      console.error("Erreur ajout événement:", error);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await api.addTimelineEvent(id, {
        type: "rejected",
        note: reason || "Candidature refusée",
        date: new Date().toISOString(),
      });
      await api.update(id, { followupDate: undefined });
      fetchApplications();
    } catch (error) {
      console.error("Erreur refus:", error);
    }
  };

  const openEdit = (app: Application) => {
    setEditingApp(app);
    setFormOpen(true);
  };

  const openTimeline = (app: Application) => {
    setTimelineApp(app);
    setTimelineOpen(true);
  };

  const openReject = (app: Application) => {
    setRejectApp(app);
    setRejectOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingApp(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            <h1 className="text-xl font-bold">JobTrail</h1>
            {alerts.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {alerts.length} en retard
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setEditingApp(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" /> Nouvelle candidature
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Onglets */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.value
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                }`}
              >
                {tab.label}
                {tabCounts[tab.value] > 0 && (
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.value
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {tabCounts[tab.value]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Filtres */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher entreprise, poste..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sources</SelectItem>
              {SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="mb-6" />

        {/* Liste */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Chargement...</div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {activeTab === "active" && "Aucune candidature en cours"}
              {activeTab === "wishlist" && "Aucune candidature en attente"}
              {activeTab === "archived" && "Aucune candidature archivée"}
            </p>
            {activeTab !== "archived" && (
              <Button
                onClick={() => {
                  setEditingApp(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> Ajouter une candidature
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3 transition-all">
            {filteredApplications.map((app, index) => (
              <div key={app._id} style={{ animationDelay: `${index * 30}ms` }}>
                <ApplicationCard
                  application={app}
                  onEdit={openEdit}
                  onDelete={(id) => openDelete(id, app.company)}
                  onAddEvent={openTimeline}
                  onReject={openReject}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <ApplicationForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={editingApp ? handleUpdate : handleCreate}
        application={editingApp}
      />

      <TimelineDialog
        open={timelineOpen}
        onClose={() => {
          setTimelineOpen(false);
          setTimelineApp(null);
        }}
        onSubmit={handleAddEvent}
        application={timelineApp}
      />

      <RejectDialog
        open={rejectOpen}
        onClose={() => {
          setRejectOpen(false);
          setRejectApp(null);
        }}
        onSubmit={handleReject}
        application={rejectApp}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleDelete}
        title="Supprimer cette candidature"
        description={`La candidature chez ${deleteName} sera définitivement supprimée. Cette action est irréversible.`}
      />
    </div>
  );
}

export default App;
