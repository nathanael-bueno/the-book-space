import { useState } from 'react'
import type { Book } from '../types/book'

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(book.likes)

  const handleLike = () => {
    setLiked((currentLiked) => {
      const nextLiked = !currentLiked
      setLikesCount((currentLikes) => currentLikes + (nextLiked ? 1 : -1))
      return nextLiked
    })
  }

  return (
    <article className="book-card">
      <img className="book-cover" src={book.cover} alt={book.title} loading="lazy" />

      <div className="book-content">
        <h2 className="book-title">{book.title}</h2>
        <p className="book-author">{book.author}</p>

        <div className="owner-row">
          <img
            className="owner-avatar"
            src={book.ownerAvatar}
            alt={book.owner}
            loading="lazy"
          />
          <span className="owner-name">{book.owner}</span>
        </div>

        <div className="engagement-row">
          <button
            type="button"
            onClick={handleLike}
            className={`engagement-btn${liked ? ' active' : ''}`}
          >
            Curtir {likesCount}
          </button>
          <button type="button" className="engagement-btn">
            Comentarios {book.comments}
          </button>
        </div>

        <div className="cta-row">
          <button type="button" className="cta-button">
            Propor troca
          </button>
          <button type="button" className="cta-button secondary">
            Quero este livro
          </button>
        </div>
      </div>
    </article>
  )
}
