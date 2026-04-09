import { useMemo, useState } from 'react'
import { booksData, categoryLabels } from './data/books'
import { BookGrid } from './components/BookGrid'
import { CategoryFilters } from './components/CategoryFilters'
import { Header } from './components/Header'
import type { CategoryFilter } from './types/book'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('todos')

  const filteredBooks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return booksData.filter((book) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.author.toLowerCase().includes(normalizedQuery)

      const matchesCategory =
        activeCategory === 'todos' || book.category === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [activeCategory, searchQuery])

  const categoryTitle =
    activeCategory === 'todos'
      ? 'Todos os livros'
      : `Livros de ${categoryLabels[activeCategory]}`

  return (
    <div className="app-shell">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <CategoryFilters
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="content-wrap">
        <section className="section-header">
          <h1 className="section-title">{categoryTitle}</h1>
          <p className="section-subtitle">
            {filteredBooks.length} livro{filteredBooks.length === 1 ? '' : 's'}{' '}
            disponivel
            {filteredBooks.length === 1 ? '' : 'eis'} para troca ou doacao
          </p>
        </section>

        <BookGrid books={filteredBooks} />
      </main>
    </div>
  )
}

export default App
