export type BookCategory =
  | 'romance'
  | 'humor'
  | 'motivacao'
  | 'terror'
  | 'outros'

export type CategoryFilter = 'todos' | BookCategory

export interface Book {
  id: string
  title: string
  author: string
  category: BookCategory
  cover: string
  likes: number
  comments: number
  owner: string
  ownerAvatar: string
}
