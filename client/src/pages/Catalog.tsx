import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Filter, MapPin, Search } from 'lucide-react'
import { books } from '../data/books'

const categories = [
  'Todos',
  'Romance',
  'Fantasia',
  'Ficcao Cientifica',
  'Tecnologia',
  'Biografia',
  'Infantil',
]

export default function Catalog() {
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim().toLowerCase()
  const [genre, setGenre] = useState('Todos')
  const [condition, setCondition] = useState('Qualquer estado')
  const [locationTerm, setLocationTerm] = useState('')
  const filteredBooks = useMemo(
    () =>
      books.filter((book) => {
        const matchesQuery =
          !query ||
          [book.title, book.author, book.city, book.isbn].some((field) =>
            field.toLowerCase().includes(query)
          )
        const matchesGenre = genre === 'Todos' || book.category === genre
        const matchesCondition =
          condition === 'Qualquer estado' || book.condition === condition
        const matchesLocation =
          !locationTerm.trim() ||
          book.city.toLowerCase().includes(locationTerm.trim().toLowerCase())
        return (
          matchesQuery && matchesGenre && matchesCondition && matchesLocation
        )
      }),
    [condition, genre, locationTerm, query]
  )

  return (
    <main className="mx-auto w-full max-w-7xl">
      <section className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {categories.map((category, index) => (
          <button
            key={category}
            type="button"
            className={[
              'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-colors',
              index === 0
                ? 'border-accent bg-accent text-white shadow-accent/15 hover:bg-brand-deep'
                : 'border-line/45 bg-white text-ink-dim hover:border-accent/35 hover:text-brand-deep',
            ].join(' ')}
          >
            {category}
          </button>
        ))}
      </section>

      <section className="mb-5 rounded-2xl border border-line/45 bg-white p-3 shadow-sm sm:p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1.35fr_auto]">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-deep">
              <Filter size={14} />
              Genero
            </span>
            <select
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              className="h-10 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            >
              <option>Todos</option>
              <option>Romance</option>
              <option>Fantasia</option>
              <option>Ficcao Cientifica</option>
              <option>Tecnologia</option>
              <option>Biografia</option>
              <option>Infantil</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand-deep">
              Estado
            </span>
            <select
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              className="h-10 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
            >
              <option>Qualquer estado</option>
              <option>Novo</option>
              <option>Muito bom</option>
              <option>Bom</option>
              <option>Usado</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-deep">
              <MapPin size={14} />
              Localizacao
            </span>
            <input
              type="text"
              value={locationTerm}
              onChange={(event) => setLocationTerm(event.target.value)}
              placeholder="Cidade ou estado"
              className="h-10 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
            />
          </label>

          <div className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-lg border border-line/55 bg-white px-4 text-sm font-semibold text-ink-dim shadow-sm">
            <Search size={16} />
            Filtrar
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredBooks.map((book) => (
          <Link
            to={`/books/${book.id}`}
            key={book.id}
            className="group overflow-hidden rounded-xl border border-line/45 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
          >
            <div className="aspect-[3/4] w-full bg-canvas/35">
              <img
                src={book.cover}
                alt={`Capa do livro ${book.title}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>

            <div className="border-t border-line/25 bg-white p-3">
              <h2 className="text-sm font-semibold leading-snug text-ink">
                {book.title}
              </h2>
              <p className="mt-1 text-xs text-ink-muted">{book.author}</p>
              <p className="mt-2 text-[11px] font-semibold text-brand-deep">
                {book.city}
              </p>
            </div>
          </Link>
        ))}
      </section>
      {!filteredBooks.length ? (
        <section className="mt-5 rounded-2xl border border-line/45 bg-white p-5 text-sm text-ink-dim shadow-sm">
          Nenhum livro encontrado para essa busca.
        </section>
      ) : null}
    </main>
  )
}
