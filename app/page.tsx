"use client";

import { useState } from "react";
import { StudySession } from "@/app/components/study-session";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initialCards, categories } from "@/app/data/initial-cards";
import { BookOpen, Trophy, BarChart3, CopyPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/app/data/initial-cards";
import { lessons } from "./data/lessons";
import { Card, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Lesson } from "./types/lesson";
import { ProfileForm } from "./components/custom/ProfileForm";
import CsvTableUploader from "./components/custom/CsvTableUploader";

import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);



export default function Home() {
  const [activeTab, setActiveTab] = useState("study");
  const [activeLesson, setActiveLesson] = useState<number>();
  const [file, setFile] = useState();
  
  const router = useRouter()
  
  const handleLessonChoice = (lesson: Lesson ) => {
    setActiveLesson(lesson);
    router.push('/' + lesson.id)     
  }
  
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
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="study">
              <BookOpen className="w-4 h-4 mr-2" />
                Ucz się 
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="w-4 h-4 mr-2" />
              Statystyka 
            </TabsTrigger>
            <TabsTrigger value="add-study-set">
              <CopyPlus className="w-4 h-4 mr-2" />
              Dodaj Zestaw
            </TabsTrigger>
          </TabsList>
          <TabsContent value="study" className="space-y-8">
            {lessons ? (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-semibold">Wybierz lekcje</h2>
                  <p className="text-muted-foreground">
                    W niej znajdziesz słówka z lekcji
                  </p>
                  {lessons.map((item, key) => (
                    <Card key={key} className="m-20 p-4 cursor-pointer" onClick={() => handleLessonChoice(item)}>
                      <CardHeader>{item.name}</CardHeader>
                    </Card>
                  ))}
                  
                </div>
              </div>
            ) : (
              <></>
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
          <TabsContent value="add-study-set" className="space-y-8" >
              <div className="flex flex-col items-center justify-center">
                <h2 className="text-2xl font-semibold mb-6">CSV Converter</h2>
                <ProfileForm setFile={setFile} />
                <CsvTableUploader text={file} />
              </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}