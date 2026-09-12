import { api } from './api';
import type { DatosDashboard } from '../utils/dashboard';
import type { Equipo } from '../types/Equipo';
import type { Categoria } from '../types/Categoria';
import type { MaintenanceResponse } from '../types/Maintenance';

// The current API exposes histories per equipment. Bound concurrency and never publish partial totals.
export async function obtenerDatosDashboard(signal?: AbortSignal): Promise<DatosDashboard> {
  const [equipos, categorias] = await Promise.all([
    api.get<Equipo[]>('/maintenances/assets', { signal }).then(r => r.data),
    api.get<Categoria[]>('/categories', { signal }).then(r => r.data),
  ]);
  const historiales: DatosDashboard['mantenimientos'][] = Array.from({ length: equipos.length }, () => []);
  let siguiente = 0;
  await Promise.all(Array.from({ length: Math.min(5, equipos.length) }, async () => {
    while (siguiente < equipos.length) {
      if (signal?.aborted) throw new Error('Carga cancelada');
      const indice = siguiente++;
      const { data } = await api.get<MaintenanceResponse[]>(`/api/mantenimientos/equipo/${equipos[indice].id}`, { signal });
      historiales[indice] = data.map(m => ({ ...m, equipoId: equipos[indice].id }));
    }
  }));
  return { equipos, categorias, mantenimientos: [...new Map(historiales.flat().map(m => [m.id, m])).values()] };
}
