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
    <form className="mb-8 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
      <input
        type="text"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Busca por artista, álbum o disco"
        aria-label="Buscar álbumes"
        disabled={disabled}
        className="w-full rounded-xl border border-[#2a3758] bg-[#0b1224] px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-lime-300"
      />
      <button
        type="submit"
        disabled={disabled || term.trim().length === 0}
        className="rounded-xl bg-lime-300 px-6 py-3 font-semibold uppercase tracking-wider text-[#0f172a] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Buscar
      </button>
    </form>
  );
};

export default SearchBar;
