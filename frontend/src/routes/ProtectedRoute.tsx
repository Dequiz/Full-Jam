import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase/supabaseclient.ts";
import { Navigate, Outlet } from "react-router-dom";
import { PulseLoader } from "react-spinners";

const ProtectedRoute = () => {

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <PulseLoader/>
  if (!session) return <Navigate to={"/"} replace/>

  return <Outlet/>
};

export default ProtectedRoute;