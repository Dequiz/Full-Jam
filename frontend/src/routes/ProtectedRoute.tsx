import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase/supabaseclient.ts";
import { Navigate, Outlet } from "react-router-dom";
import { PulseLoader } from "react-spinners";
import { toast } from "sonner";
import { authService } from "../service/authService.ts";

export type Role = "PROPRIETARIO" | "FUNCIONARIO"
export interface RouteContext {
  role: Role
}

interface Profile {
  userId: string
  role: Role | null
}


const ProtectedRoute = () => {

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe()

  }, [])

  const userId = session?.user?.id

  useEffect(() => {
    if (!userId) { return }

    let cancelled = false

    supabase
      .from("Usuarios")
      .select("ROLE, ATIVO")
      .eq("ID_USUARIO", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) { return }

        if (error) {
          toast.error("Erro ao carregar seu perfil");
          setProfile({ userId, role: null });
          return;
        }

        if (!data || !data.ATIVO) {
          toast.error(data ? "Seu usuário está inativo" : "Usuário sem cadastro no sistema")
          authService.signOut()
          setProfile({userId, role: null})
          return
        } else {
          setProfile({userId, role: data.ROLE as Role})
        }
      })

    return () => {
      cancelled = true;
    }
  }, [userId]);

  const profileMatches = profile !== null && profile.userId === userId
  const role = profileMatches ? profile.role : null
  const roleLoading = Boolean(userId) && !profileMatches

  if (loading || roleLoading) return <PulseLoader/>
  if (!session || !role) return <Navigate to={"/"} replace/>

  return <Outlet context={{role} satisfies RouteContext}/>
};

export default ProtectedRoute;