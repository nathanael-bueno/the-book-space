import { categoryLabels } from '../data/books'
import type { CategoryFilter } from '../types/book'

const categoryList: CategoryFilter[] = [
  'todos',
  'romance',
  'humor',
  'motivacao',
  'terror',
  'outros',
]

interface CategoryFiltersProps {
  activeCategory: CategoryFilter
  onCategoryChange: (category: CategoryFilter) => void
}

export function CategoryFilters({
  activeCategory,
  onCategoryChange,
}: CategoryFiltersProps) {
  return (
    <div className="category-strip">
      <div className="content-wrap">
        <div className="category-list">
          {categoryList.map((category) => {
            const isActive = category === activeCategory

            return (
              <button
                type="button"
                key={category}
                className={`category-chip${isActive ? ' active' : ''}`}
                onClick={() => onCategoryChange(category)}
              >
                {categoryLabels[category]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
