interface EmptyStateProps {
  hasSearched: boolean;
}

const EmptyState = ({ hasSearched }: EmptyStateProps) => {
  if (!hasSearched) {
    return <p className="mt-8 text-slate-400">Escribe algo en el buscador para encontrar portadas de discos.</p>;
  }

  return <p className="mt-8 text-slate-400">No se encontraron resultados para tu búsqueda.</p>;
};

export default EmptyState;
