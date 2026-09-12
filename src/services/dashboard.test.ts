import { afterEach, describe, expect, it } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { api } from './api';
import { obtenerDatosDashboard } from './dashboard.service';
const mock = new MockAdapter(api);
afterEach(() => mock.reset());
describe('carga del dashboard', () => {
  it('asocia cada historial con su equipo y elimina registros duplicados', async () => {
    mock.onGet('/maintenances/assets').reply(200, [{ id: 'a' }, { id: 'b' }]);
    mock.onGet('/categories').reply(200, []);
    mock.onGet('/maintenances/locations').reply(200, []);
    mock.onGet('/api/mantenimientos/equipo/a').reply(200, [{ id: '1', costo: 10 }, { id: '1', costo: 10 }]);
    mock.onGet('/api/mantenimientos/equipo/b').reply(200, [{ id: '2', costo: 20 }]);
    expect((await obtenerDatosDashboard()).mantenimientos).toEqual([{ id: '1', costo: 10, equipoId: 'a' }, { id: '2', costo: 20, equipoId: 'b' }]);
  });
  it('rechaza totales parciales si falla un historial', async () => {
    mock.onGet('/maintenances/assets').reply(200, [{ id: 'a' }, { id: 'b' }]);
    mock.onGet('/categories').reply(200, []);
    mock.onGet('/maintenances/locations').reply(200, []);
    mock.onGet('/api/mantenimientos/equipo/a').reply(200, [{ id: '1', costo: 10 }]);
    mock.onGet('/api/mantenimientos/equipo/b').reply(500);
    await expect(obtenerDatosDashboard()).rejects.toThrow();
  });
});
