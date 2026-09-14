export const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case "ACTIVO":
      return {
        label: "Activo",
        dotColor: "bg-emerald-500",
        badgeStyle: "bg-emerald-50/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/60",
      };
    case "EN_MANTENIMIENTO":
      return {
        label: "En Mantenimiento",
        dotColor: "bg-amber-500",
        badgeStyle: "bg-amber-50/80 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/60",
      };
    case "DADO_DE_BAJA":
      return {
        label: "Dado de Baja",
        dotColor: "bg-rose-500",
        badgeStyle: "bg-rose-50/80 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/60",
      };
    default:
      return {
        label: estado ? estado.replace(/_/g, " ") : "Desconocido",
        dotColor: "bg-slate-400",
        badgeStyle: "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      };
  }
};