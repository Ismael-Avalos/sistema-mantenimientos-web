import { useEffect, useState } from "react";
import { obtenerEquipos } from "../services/equipos.service";
import type { Equipo } from "../types/Equipo";

function Equipos() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const datos = await obtenerEquipos();
        setEquipos(datos);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  if (cargando) {
    return <h2>Cargando...</h2>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Equipos</h1>

      <p>Total: {equipos.length}</p>

      {equipos.map((equipo) => (
        <div key={equipo.id}>
          {equipo.codigoInventario} - {equipo.nombre}
        </div>
      ))}
    </div>
  );
}

export default Equipos;