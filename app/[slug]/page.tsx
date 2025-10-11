"use client";


import Study from "./study";
import { useEffect, useState } from "react";
import { StudySession } from "@/app/components/study-session";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initialCards, categories } from "@/app/data/initial-cards";
import { BookOpen, Trophy, BarChart3, CopyPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/app/data/initial-cards";
import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../amplify/data/resource'
import StudyMenu from "./study-menu";
import { lessons } from "../data/lessons";
import { Lesson } from "../types/lesson";
import { ProfileForm } from "@/app/components/custom/ProfileForm";
import CsvTableUploader from "@/app/components/custom/CsvTableUploader";


const client = generateClient<Schema>({
  authMode: 'userPool'
})

export default function Page({ params } : { params : Promise<{slug: string}>}){
  
  
  // console.log(client.models)

  const [activeTab, setActiveTab] = useState("study");
  const [isStudying, setIsStudying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [words, setWords] = useState<any>()
  const [file, setFile] = useState();

  const [lesson, setLesson] = useState<any>(null);

  // 1️⃣ Resolve lesson from slug
  useEffect(() => {
    if (!params?.slug) return

    const num = Number(params.slug) // Convert slug (string) → number
    const foundLesson = lessons.find(item => item.id === num)

    console.log("Slug:", params.slug, "→ as number:", num)
    console.log("Lesson:", foundLesson)

    setLesson(foundLesson)
  }, [params.slug]) 

  // Kod odpowiedzialny za fetchowanie z bazy danych
  // Narazie olać
  useEffect(() => {
    if (!lesson) return

    const getWords = async () => {
      try {
        const { data, errors } = await client.models.Words.list({
          filter: {
            lesson: {
              eq: lesson.id, // 👈 filter by the actual lesson id
            },
          },
        })

        if (errors) console.error(errors)
        else setWords(data)
      } catch (err) {
        console.error("Error fetching words:", err)
      }
    }

    getWords()
  }, [lesson])

  useEffect(() => {
    console.log("Fetched words:", words)
  }, [words])
  
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

  if (!lesson) return <p>Loading...</p>;

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
              Progres 
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="study">
              <BookOpen className="w-4 h-4 mr-2" />
                Ucz się 
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="w-4 h-4 mr-2" />
              Statystyka 
            </TabsTrigger>
        </TabsList>

          <TabsContent value="study" className="space-y-8">
            {!isStudying ? (
              <>
              <Study
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                initialCards={initialCards}
                categoryCount={categoryCount}
                filteredCards={filteredCards}
                setIsStudying={setIsStudying}
              /> 
                <StudyMenu lesson={ lesson} />
              </>
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