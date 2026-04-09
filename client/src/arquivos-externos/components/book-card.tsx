"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, MessageCircle, ArrowLeftRight, BookMarked } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface Book {
  id: string
  title: string
  author: string
  category: string
  cover: string
  likes: number
  comments: number
  owner: string
  ownerAvatar: string
}

interface BookCardProps {
  book: Book
}

export function BookCard({ book }: BookCardProps) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(book.likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount(prev => liked ? prev - 1 : prev + 1)
  }

  return (
    <Card className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-[3/4] bg-muted">
        <Image
          src={book.cover}
          alt={book.title}
          fill
          className="object-cover"
        />
      </div>
      
      <CardContent className="p-4">
        {/* Book Info */}
        <h3 className="font-semibold text-foreground line-clamp-1 text-lg">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {book.author}
        </p>
        
        {/* Owner Info */}
        <div className="flex items-center gap-2 mt-3">
          <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
            <Image
              src={book.ownerAvatar}
              alt={book.owner}
              width={24}
              height={24}
              className="object-cover"
            />
          </div>
          <span className="text-xs text-muted-foreground">{book.owner}</span>
        </div>

        {/* Actions - Like & Comment */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Heart 
              className={cn(
                "w-5 h-5 transition-all",
                liked && "fill-primary text-primary scale-110"
              )} 
            />
            <span>{likesCount}</span>
          </button>
          
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span>{book.comments}</span>
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-2 mt-4">
          <Button 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="sm"
          >
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Propor Troca
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            size="sm"
          >
            <BookMarked className="w-4 h-4 mr-2" />
            Quero Este Livro
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
