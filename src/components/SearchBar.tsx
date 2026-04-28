import { FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (term: string) => void;
  disabled?: boolean;
}

const SearchBar = ({ onSearch, disabled = false }: SearchBarProps) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(term);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Busca por artista, álbum o disco"
        aria-label="Buscar álbumes"
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || term.trim().length === 0}>
        Buscar
      </button>
    </form>
  );
};

export default SearchBar;
