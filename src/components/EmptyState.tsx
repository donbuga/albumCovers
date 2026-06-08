interface EmptyStateProps {
  hasSearched: boolean;
}

const EmptyState = ({ hasSearched }: EmptyStateProps) => {
  if (!hasSearched) {
    return <p className="mt-8 text-slate-400">Los resultados aparecerán aquí</p>;
  }

  return <p className="mt-8 text-slate-400">No se encontraron álbumes. Prueba con otro artista o explora el mapa.</p>;
};

export default EmptyState;
