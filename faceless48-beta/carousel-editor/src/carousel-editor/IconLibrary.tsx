import React, {useState} from 'react';
type Icon = {src: string; name: string; category: string};
declare const process: {env: {CAROUSEL_ICON_LIBRARY: Icon[]}};
const library = process.env.CAROUSEL_ICON_LIBRARY;

const categories = [...new Set(library.map(({category}) => category))].sort();
const pageSize = 24;

export function IconLibrary({onPick}: {onPick: (src: string) => void}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = library.filter((item) => {
    const label = (item.name + ' ' + item.category).toLowerCase();
    return (!category || item.category === category) && words.every((word) => label.includes(word));
  });
  const pages = Math.max(1, Math.ceil(matches.length / pageSize));
  return (
    <div className="icon-library" aria-label="C3 icon library">
      <label>Search icons
        <input type="search" placeholder="Calendar, question, globe…" value={query} onChange={(event) => {setQuery(event.currentTarget.value); setPage(0);}} />
      </label>
      <label>Collection
        <select value={category} onChange={(event) => {setCategory(event.currentTarget.value); setPage(0);}}>
          <option value="">All collections</option>
          {categories.map((name) => <option key={name}>{name}</option>)}
        </select>
      </label>
      <p aria-live="polite">{matches.length} {matches.length === 1 ? 'icon' : 'icons'}</p>
      <div className="icon-grid">
        {matches.slice(page * pageSize, (page + 1) * pageSize).map(({src, name}) => (
          <button key={src} title={name} onClick={() => onPick(src)}>
            <img alt="" loading="lazy" src={`/assets/${src}`} />
            <span>{name}</span>
          </button>
        ))}
      </div>
      {pages > 1 && <div className="icon-pagination">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
        <span>{page + 1} / {pages}</span>
        <button disabled={page + 1 === pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>}
    </div>
  );
}
