import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Briefcase, Lock } from "lucide-react";
import { auth } from "@/lib/api";

interface Props {
    onLogin: () => void;
}

export function LoginScreen({ onLogin }: Props) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await auth.login(password);
            onLogin();
        } catch {
            setError("Mot de passe incorrect");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-sm p-8 space-y-6">
                <div className="flex flex-col items-center gap-2">
                    <Briefcase className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold">JobTrail</h1>
                    <p className="text-sm text-muted-foreground">Entrez votre mot de passe</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="password"
                            placeholder="Mot de passe"
                            className="pl-9"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                            autoComplete="off"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <Button type="submit" className="w-full" disabled={loading || !password}>
                        {loading ? "Connexion..." : "Accéder"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}