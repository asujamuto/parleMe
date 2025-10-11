import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Study({
    selectedCategory,
    setSelectedCategory,
    initialCards,
    categories,
    categoryCount,
    filteredCards,
    setIsStudying
}) {

    return (
        <div className="space-y-8">
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={selectedCategory === 'all' ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Wszystko ({initialCards.length})
                  </Badge>
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category} ({categoryCount[category]})
                    </Badge>
                  ))}
                </div>

                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-semibold">Gotowy do nauki?</h2>
                  <p className="text-muted-foreground">
                    Rozpocznij sesje z {filteredCards.length} fiszkami
                    {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                  </p>
                  <Button onClick={() => setIsStudying(true)} size="lg">
                    Rozpocznij
                  </Button>
                </div>
              </div>
    )

}