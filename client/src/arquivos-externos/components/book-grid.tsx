"use client"

import { BookCard, type Book } from "./book-card"

interface BookGridProps {
  books: Book[]
}

export function BookGrid({ books }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-3xl">📚</span>
        </div>
        <h3 className="text-lg font-medium text-foreground">
          Nenhum livro encontrado
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Tente buscar por outro termo ou categoria
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}
