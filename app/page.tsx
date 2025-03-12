"use client";

import { useState } from "react";
import { StudySession } from "@/app/components/study-session";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initialCards, categories } from "@/app/data/initial-cards";
import { BookOpen, Trophy, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/app/data/initial-cards";
import { lessons } from "./data/lessons";
import { Card, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Home() {
  const [activeTab, setActiveTab] = useState("study");
  const [activeLesson, setActiveLesson] = useState<number>();
  
  const router = useRouter()
  
  const handleLessonChoice = (id: number) => {
    setActiveLesson(id);
    router.push('/' + id)     
  }
  
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
            {lessons ? (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-semibold">Wybierz lekcje</h2>
                  <p className="text-muted-foreground">
                    W niej znajdziesz słówka z lekcji
                  </p>
                  {lessons.map((item, key) => (
                    <Card key={key} className="m-20 p-4 cursor-pointer" onClick={() => handleLessonChoice(item.id)}>
                      <CardHeader>Lekcja {item.id}</CardHeader>
                    </Card>
                  ))}
                  
                </div>
              </div>
            ) : (
              <></>
            )}
          </TabsContent>

          
        </Tabs>
      </div>
    </main>
  );
}