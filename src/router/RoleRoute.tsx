import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/types/Auth";
import { hasRole } from "@/utils/roles";

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || !hasRole(user.rol, allowedRoles)) {
    return <Navigate to="/equipos" state={{ deniedFrom: location }} replace />;
  }

  return <Outlet />;
}
