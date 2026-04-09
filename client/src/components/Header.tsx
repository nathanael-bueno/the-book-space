interface HeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="content-wrap site-header-inner">
        <div className="brand">
          <div className="brand-badge">TB</div>
          <span className="brand-name">The Book Space</span>
        </div>

        <label className="search-wrap" htmlFor="book-search">
          <span className="search-icon" aria-hidden="true">
            Buscar
          </span>
          <input
            id="book-search"
            className="search-input"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Pesquisar por titulo ou autor"
          />
        </label>

        <div className="header-actions">
          <button type="button" className="header-action-btn">
            Notifs
          </button>
          <button type="button" className="header-action-btn">
            Perfil
          </button>
        </div>
      </div>
    </header>
  )
}
