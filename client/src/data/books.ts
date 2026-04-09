import type { Book, CategoryFilter } from '../types/book'

export const categoryLabels: Record<CategoryFilter, string> = {
  todos: 'todos',
  romance: 'romance',
  humor: 'humor',
  motivacao: 'motivacao',
  terror: 'terror',
  outros: 'outros',
}

export const booksData: Book[] = [
  {
    id: '1',
    title: 'Orgulho e Preconceito',
    author: 'Jane Austen',
    category: 'romance',
    cover:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
    likes: 128,
    comments: 24,
    owner: 'Maria Silva',
    ownerAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop',
  },
  {
    id: '2',
    title: 'O Pequeno Principe',
    author: 'Antoine de Saint-Exupery',
    category: 'outros',
    cover:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
    likes: 256,
    comments: 45,
    owner: 'Joao Santos',
    ownerAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop',
  },
  {
    id: '3',
    title: 'O Poder do Habito',
    author: 'Charles Duhigg',
    category: 'motivacao',
    cover:
      'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop',
    likes: 89,
    comments: 12,
    owner: 'Ana Costa',
    ownerAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop',
  },
  {
    id: '4',
    title: 'It - A Coisa',
    author: 'Stephen King',
    category: 'terror',
    cover:
      'https://cdn.dooca.store/81243/products/emgl7q3nsqhgzwl7lkkofkx3z1ycowvdp5wq.jpg?v=1671220962p',
    likes: 167,
    comments: 38,
    owner: 'Pedro Lima',
    ownerAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop',
  },
  {
    id: '5',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    category: 'romance',
    cover:
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop',
    likes: 203,
    comments: 56,
    owner: 'Carla Mendes',
    ownerAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop',
  },
  {
    id: '6',
    title: 'O Guia do Mochileiro das Galaxias',
    author: 'Douglas Adams',
    category: 'humor',
    cover:
      'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=300&h=400&fit=crop',
    likes: 145,
    comments: 29,
    owner: 'Lucas Ferreira',
    ownerAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop',
  },
  {
    id: '7',
    title: 'Mindset',
    author: 'Carol S. Dweck',
    category: 'motivacao',
    cover:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=400&fit=crop',
    likes: 178,
    comments: 41,
    owner: 'Fernanda Rocha',
    ownerAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop',
  },
  {
    id: '8',
    title: 'O Iluminado',
    author: 'Stephen King',
    category: 'terror',
    cover:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
    likes: 192,
    comments: 33,
    owner: 'Rafael Alves',
    ownerAvatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop',
  },
  {
    id: '9',
    title: 'Cem Anos de Solidao',
    author: 'Gabriel Garcia Marquez',
    category: 'romance',
    cover:
      'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=300&h=400&fit=crop',
    likes: 234,
    comments: 67,
    owner: 'Juliana Martins',
    ownerAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=50&h=50&fit=crop',
  },
  {
    id: '10',
    title: 'Viagem ao Centro da Terra',
    author: 'Julio Verne',
    category: 'outros',
    cover:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=400&fit=crop',
    likes: 112,
    comments: 19,
    owner: 'Bruno Oliveira',
    ownerAvatar:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=50&h=50&fit=crop',
  },
]
