"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { parseCSVContent } from 'zod-csv'
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
// import { formSchema, csvParserSchema } from "./utils/csvParserSchema"
import { formSchema, csvParserSchema } from "@/utils/csvParserSchema"


export function ProfileForm({ setFile }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            courseName: "",
            lessonID: "",
            file:undefined 
        },
    })
    
    // 2. Define a submit handler.
    const onSubmit = async(values: z.infer<typeof formSchema>) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
        if(!values.file) return;
        try { 
            const text = await values.file.text();
            console.log(text)
            setFile(text);
            const result = parseCSVContent(text, csvParserSchema);
            try {
      
                if (!result.success) {
                    // setCsvError('Niepoprawny plik CSV');
                    console.error(result.error);
                } else {
                    // setCsvData(result.data);
                    // setCsvError(null);
                    console.log('CSV parsed successfully:', result.data);
                }
            } 
            catch (err) {
                console.error('Error reading file:', err);
                // setCsvError('Błąd podczas odczytu pliku');
            }
        }
        finally {
            console.log("OK")
        }
    };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="courseName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa Fiszek</FormLabel>
              <FormControl>
                <Input placeholder="np. Fiszki Zwierzęta..." {...field} />
              </FormControl>
              <FormDescription>
                Nazwa będzie widoczna dla innych
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lessonID"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wybierz Lekcję</FormLabel>
              <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Lekcja..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">2ITA 1</SelectItem>
                            <SelectItem value="dark">2ITA 2</SelectItem>
                            <SelectItem value="system">2ITA 3</SelectItem>
                        </SelectContent>
                    </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wybierz Lekcję</FormLabel>
              <FormControl>
                    <Input id="picture" type="file" accept=".csv" onChange={
                        (e: { target: { files: File[] } }) => {
                            const file = e.target.files?.[0];
                            form.setValue("file", file);
                        }
                    }/>
                </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}