export type Book = {
  id: string
  title: string
  author: string
  isbn: string
  cover: string
  city: string
  category: string
  condition: string
  owner: string
  description: string
}

export const books: Book[] = [
  {
    id: '1',
    title: 'Dom Casmurro',
    author: 'Machado de Assis',
    isbn: '978-85-01-00001-1',
    cover:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    city: 'Sao Paulo, SP',
    category: 'Romance',
    condition: 'Muito bom',
    owner: 'Marcos Macedo',
    description:
      'Classico da literatura brasileira em edicao bem conservada, ideal para leitura, estudo ou colecao.',
  },
  {
    id: '2',
    title: 'Grande Sertao: Veredas',
    author: 'Joao Guimaraes Rosa',
    isbn: '978-85-01-00002-8',
    cover:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    city: 'Belo Horizonte, MG',
    category: 'Romance',
    condition: 'Bom',
    owner: 'Ana Ribeiro',
    description:
      'Obra essencial de Guimaraes Rosa, com marcas leves de uso e paginas preservadas.',
  },
  {
    id: '3',
    title: 'Capitaes da Areia',
    author: 'Jorge Amado',
    isbn: '978-85-01-00003-5',
    cover:
      'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800',
    city: 'Salvador, BA',
    category: 'Romance',
    condition: 'Muito bom',
    owner: 'Bruno Costa',
    description:
      'Livro com capa integra e miolo limpo, pronto para circular entre novos leitores.',
  },
  {
    id: '4',
    title: 'Memorias Postumas',
    author: 'Machado de Assis',
    isbn: '978-85-01-00004-2',
    cover:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800',
    city: 'Rio de Janeiro, RJ',
    category: 'Romance',
    condition: 'Usado',
    owner: 'Carla Mendes',
    description:
      'Edicao usada, mas completa. Boa escolha para quem quer conhecer Machado de Assis.',
  },
  {
    id: '5',
    title: 'O Alienista',
    author: 'Machado de Assis',
    isbn: '978-85-01-00005-9',
    cover:
      'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
    city: 'Curitiba, PR',
    category: 'Romance',
    condition: 'Novo',
    owner: 'Diego Lima',
    description:
      'Exemplar novo, sem anotacoes. Narrativa curta e marcante para leitura rapida.',
  },
  {
    id: '6',
    title: 'A Hora da Estrela',
    author: 'Clarice Lispector',
    isbn: '978-85-01-00006-6',
    cover:
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800',
    city: 'Recife, PE',
    category: 'Romance',
    condition: 'Muito bom',
    owner: 'Eduarda Nunes',
    description:
      'Livro em otimo estado, com texto sensivel e forte de Clarice Lispector.',
  },
]
