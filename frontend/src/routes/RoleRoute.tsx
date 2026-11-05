import type { Role, RouteContext } from "./ProtectedRoute.tsx";
import { Navigate, Outlet, useOutletContext } from "react-router-dom";

const RoleRoute = ({allowed}: {allowed: Role[]}) => {

  const context = useOutletContext<RouteContext>()

  if(!allowed.includes(context.role)) {
    return <Navigate to="/estoque" replace />
  }

  return <Outlet context={context}/>
};

export default RoleRoute;