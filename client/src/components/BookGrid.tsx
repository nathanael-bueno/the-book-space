import type { Book } from '../types/book'
import { BookCard } from './BookCard'

interface BookGridProps {
  books: Book[]
}

export function BookGrid({ books }: BookGridProps) {
  if (books.length === 0) {
    return (
      <section className="empty-state">
        <h2>Nenhum livro encontrado</h2>
        <p>Tente buscar outro termo ou escolha outra categoria.</p>
      </section>
    )
  }

  return (
    <section className="book-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </section>
  )
}
