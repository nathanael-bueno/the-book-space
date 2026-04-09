"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Heart, 
  Laugh, 
  Sparkles, 
  Ghost, 
  MoreHorizontal 
} from "lucide-react"

const categories = [
  { id: "todos", label: "Todos", icon: BookOpen },
  { id: "romance", label: "Romance", icon: Heart },
  { id: "humor", label: "Humor", icon: Laugh },
  { id: "motivacao", label: "Motivação", icon: Sparkles },
  { id: "terror", label: "Terror", icon: Ghost },
  { id: "outros", label: "Outros", icon: MoreHorizontal },
]

interface CategoryFiltersProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryFilters({ activeCategory, onCategoryChange }: CategoryFiltersProps) {
  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id
            
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "secondary"}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-full transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
