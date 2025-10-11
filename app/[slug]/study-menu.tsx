"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Lesson } from "../types/lesson";


export default function StudyMenu({lesson} : { lesson: Lesson}) {
    const chapters = lesson.chapters;

    return (
    <div className="flex justify-center items-center flex-wrap gap-4 p-5">
        {chapters.map((category, index) => (
            <Card key={index} className="w-[20vw] flex flex-col justify-center items-center p-5">
                <CardContent>{category.categoryName}</CardContent>
                <Button className="font-bold">Start</Button>
            </Card>
        ))}
    </div>
    );
}
