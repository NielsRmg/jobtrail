import {API_BASE} from "@/lib/config";

const API_URL = `${API_BASE}/api/applications`;
const AUTH_URL = `${API_BASE}/api/auth`;

function getToken(): string | null {
    return localStorage.getItem("jobtrail_token");
}

function authHeaders(): Record<string, string> {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? {Authorization: `Bearer ${token}`} : {}),
    };
}

export interface Contact {
    _id?: string;
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
}

export interface TimelineEvent {
    _id?: string;
    date: string;
    type: string;
    note?: string;
}

export interface Attachment {
    _id?: string;
    filename: string;
    path: string;
    type: string;
    addedAt?: string;
}

export interface Application {
    _id?: string;
    company: string;
    position: string;
    url?: string;
    location?: { city?: string; remote?: boolean };
    contractType?: string;
    salary?: { min?: number; max?: number; currency?: string };
    source?: string;
    status: string;
    appliedAt?: string;
    followupDate?: string;
    tags?: string[];
    contacts?: Contact[];
    timeline?: TimelineEvent[];
    attachments?: Attachment[];
    notes?: string;
    daysUntilFollowup?: number | null;
    isOverdue?: boolean;
    urgencyColor?: string;
    urgencyScore?: number;
    createdAt?: string;
    updatedAt?: string;
}

export const auth = {
    async login(password: string): Promise<string> {
        const res = await fetch(`${AUTH_URL}/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({password}),
        });
        if (!res.ok) throw new Error("Mot de passe incorrect");
        const data = await res.json();
        localStorage.setItem("jobtrail_token", data.token);
        return data.token;
    },

    logout() {
        localStorage.removeItem("jobtrail_token");
    },

    isLoggedIn(): boolean {
        return !!getToken();
    },
};

export const api = {
    async getAll(params?: { status?: string; source?: string; search?: string }): Promise<Application[]> {
        const query = new URLSearchParams();
        if (params?.status) query.set("status", params.status);
        if (params?.source) query.set("source", params.source);
        if (params?.search) query.set("search", params.search);
        const res = await fetch(`${API_URL}?${query}`, {headers: authHeaders()});
        if (res.status === 401) throw new Error("UNAUTHORIZED");
        if (!res.ok) throw new Error("Erreur lors de la récupération");
        return res.json();
    },

    async getOne(id: string): Promise<Application> {
        const res = await fetch(`${API_URL}/${id}`, {headers: authHeaders()});
        if (res.status === 401) throw new Error("UNAUTHORIZED");
        if (!res.ok) throw new Error("Candidature non trouvée");
        return res.json();
    },

    async create(data: Partial<Application>): Promise<Application> {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401) throw new Error("UNAUTHORIZED");
        if (!res.ok) throw new Error("Erreur lors de la création");
        return res.json();
    },

    async update(id: string, data: Partial<Application>): Promise<Application> {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        if (res.status === 401) throw new Error("UNAUTHORIZED");
        if (!res.ok) throw new Error("Erreur lors de la mise à jour");
        return res.json();
    },

    async remove(id: string): Promise<void> {
        const res = await fetch(`${API_URL}/${id}`, {method: "DELETE", headers: authHeaders()});
        if (res.status === 401) throw new Error("UNAUTHORIZED");
        if (!res.ok) throw new Error("Erreur lors de la suppression");
    },

    async addTimelineEvent(id: string, event: Partial<TimelineEvent>): Promise<Application> {
        const res = await fetch(`${API_URL}/${id}/timeline`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(event),
        });
        if (res.status === 401) throw new Error("UNAUTHORIZED");
        if (!res.ok) throw new Error("Erreur lors de l'ajout d'événement");
        return res.json();
    },

    async getAlerts(): Promise<Application[]> {
        const res = await fetch(`${API_URL}/alerts`, {headers: authHeaders()});
        if (res.status === 401) throw new Error("UNAUTHORIZED");
        if (!res.ok) throw new Error("Erreur lors de la récupération des alertes");
        return res.json();
    },
};