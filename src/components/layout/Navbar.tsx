import { Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [valorBusqueda, setValorBusqueda] = useState(searchParams.get("q") ?? "");

  const contexto = useMemo(() => {
    const { pathname } = location;

    if (pathname === "/" || pathname.startsWith("/equipos")) {
      return { rutaListado: "/equipos", placeholder: "Buscar equipos por nombre o código..." };
    }
    if (pathname.startsWith("/ubicaciones")) {
      return { rutaListado: "/ubicaciones", placeholder: "Buscar ubicaciones por nombre..." };
    }
    if (pathname.startsWith("/categorias")) {
      return { rutaListado: "/categorias", placeholder: "Buscar categorías por nombre..." };
    }
    if (pathname.startsWith("/usuarios")) {
      return { rutaListado: "/usuarios", placeholder: "Buscar usuarios por nombre..." };
    }

    return null;
  }, [location]);

  const esListado = contexto !== null && location.pathname === contexto.rutaListado;

  useEffect(() => {
    setValorBusqueda(searchParams.get("q") ?? "");
  }, [searchParams]);

  const actualizarParametros = (valor: string) => {
    const parametros = new URLSearchParams(searchParams);
    const consulta = valor.trim();
    if (consulta) {
      parametros.set("q", valor);
    } else {
      parametros.delete("q");
    }
    return parametros;
  };

  const handleChange = (valor: string) => {
    setValorBusqueda(valor);
    if (esListado) {
      setSearchParams(actualizarParametros(valor), { replace: true });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (contexto && !esListado) {
      const consulta = actualizarParametros(valorBusqueda).toString();
      navigate({ pathname: contexto.rutaListado, search: consulta ? `?${consulta}` : "" });
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 gap-3">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Abrir menú de navegación"
          className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
        >
          <Menu className="w-5 h-5" />
        </button>

        {contexto && (
          <form className="relative w-full" onSubmit={handleSubmit} role="search">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              value={valorBusqueda}
              onChange={(event) => handleChange(event.target.value)}
              placeholder={contexto.placeholder}
              aria-label={contexto.placeholder}
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-700 transition-colors"
            />
            {valorBusqueda && (
              <button
                type="button"
                onClick={() => handleChange("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        )}
      </div>

    </header>
  );
}
