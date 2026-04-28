interface EmptyStateProps {
  hasSearched: boolean;
}

const EmptyState = ({ hasSearched }: EmptyStateProps) => {
  if (!hasSearched) {
    return (
      <p className="state-message">
        Escribe algo en el buscador para encontrar portadas de discos.
      </p>
    );
  }

  return <p className="state-message">No se encontraron resultados para tu búsqueda.</p>;
};

export default EmptyState;
