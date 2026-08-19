export const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case "ACTIVO":
      return {
        label: "Activo",
        dotColor: "bg-emerald-500",
        badgeStyle: "bg-emerald-50/80 text-emerald-700 border-emerald-200/60",
      };
    case "EN_MANTENIMIENTO":
      return {
        label: "En Mantenimiento",
        dotColor: "bg-amber-500",
        badgeStyle: "bg-amber-50/80 text-amber-700 border-amber-200/60",
      };
    case "DADO_DE_BAJA":
      return {
        label: "Dado de Baja",
        dotColor: "bg-rose-500",
        badgeStyle: "bg-rose-50/80 text-rose-700 border-rose-200/60",
      };
    default:
      return {
        label: estado ? estado.replace(/_/g, " ") : "Desconocido",
        dotColor: "bg-slate-400",
        badgeStyle: "bg-slate-50 text-slate-600 border-slate-200",
      };
  }
};