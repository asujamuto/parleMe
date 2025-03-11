"use client";

import { useState } from "react";
import { StudySession } from "@/app/components/study-session";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initialCards, categories } from "@/app/data/initial-cards";
import { BookOpen, Trophy, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/app/data/initial-cards";
import { useParams } from "next/navigation";



export default function Page({ params } : { params : any}){
  console.log(params)

  const [activeTab, setActiveTab] = useState("study");
  const [isStudying, setIsStudying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  // const filteredCards = selectedCategory === 'all' 
  //   ? initialCards
  //   : initialCards.filter(card => card.category === selectedCategory);
  
   const filteredCards = selectedCategory === 'all'
   ? [...initialCards] // Spread to create a mutable array
   : initialCards.filter(card => card.category === selectedCategory);

  const handleCompleteSession = () => {
    setIsStudying(false);
  };
 

  // const { slug } = async () => { const res = await params; return res; }
  // const { slug } = await params;
  //Function that fetches lesson by id
  // const lessonID = useParams();
  // console.log(lessonID.slug)

  const categoryCount = categories.reduce((acc, category) => {
    acc[category] = initialCards.filter(card => card.category === category).length;
    return acc;
  }, {} as Record<Category, number>);

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-primary">
            parleMe
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Trophy className="w-4 h-4 mr-2" />
              Progress
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="study">
              <BookOpen className="w-4 h-4 mr-2" />
              Study
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="study" className="space-y-8">
            {!isStudying ? (
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
                  <h2 className="text-2xl font-semibold">Ready to study?</h2>
                  <p className="text-muted-foreground">
                    Start a new session with {filteredCards.length} cards
                    {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                  </p>
                  <Button onClick={() => setIsStudying(true)} size="lg">
                    Start Session
                  </Button>
                </div>
              </div>
            ) : (
              <StudySession
                cards={filteredCards}
                onComplete={handleCompleteSession}
              />
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Total Cards</h3>
                <p className="text-3xl font-bold">{initialCards.length}</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Categories</h3>
                <p className="text-3xl font-bold">{categories.length}</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Mastered</h3>
                <p className="text-3xl font-bold">0</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Need Review</h3>
                <p className="text-3xl font-bold">{initialCards.length}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {categories.map(category => (
                <div key={category} className="rounded-lg border p-4">
                  <h3 className="font-semibold mb-2 capitalize">{category}</h3>
                  <p className="text-2xl font-bold">{categoryCount[category]} cards</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}