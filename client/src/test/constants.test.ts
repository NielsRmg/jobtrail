import {describe, it, expect} from "vitest";
import {getFollowupLabel, STATUS_CONFIG} from "@/lib/constants";

describe("getFollowupLabel", () => {
    it("retourne 'Aujourd'hui' pour 0 jour", () => {
        expect(getFollowupLabel(0)).toBe("Aujourd'hui");
    });

    it("retourne 'Dépassée de X jours' quand la relance est passée", () => {
        expect(getFollowupLabel(-3)).toBe("Dépassée de 3 jours");
    });

    it("retourne une chaîne vide si null", () => {
        expect(getFollowupLabel(null)).toBe("");
    });
});

describe("STATUS_CONFIG", () => {
    it("contient tous les statuts attendus", () => {
        const statuts = ["wishlist", "applied", "followup", "interview", "offer", "accepted", "rejected", "ghosted"];
        statuts.forEach((s) => {
            expect(STATUS_CONFIG[s]).toBeDefined();
        });
    });
});