"use client";

import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";

type Testimonial = {
  id: string;
  clientName: string;
  quote: string;
};

export default function TestimonialsPage() {
  const firestore = useFirestore();
  const testimonialsCollection = firestore ? collection(firestore, "testimonials") : null;
  const { data: testimonials, loading } = useCollection<Testimonial>(testimonialsCollection);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:px-6">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Testimonials
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          What clients are saying about my work.
        </p>
      </section>
      <section className="mt-12">
        {loading ? (
           <div className="grid gap-8 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-full" />
                   <Skeleton className="h-5 w-4/5" />
                </CardHeader>
                <CardFooter>
                  <Skeleton className="h-6 w-1/3" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {testimonials?.map((testimonial) => (
              <Card key={testimonial.id} className="flex flex-col">
                <CardHeader className="flex-grow">
                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_,i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                  <blockquote className="text-lg italic text-foreground">"{testimonial.quote}"</blockquote>
                </CardHeader>
                <CardFooter>
                  <p className="font-semibold text-right w-full">- {testimonial.clientName}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
         {(!loading && testimonials?.length === 0) && (
            <div className="text-center text-muted-foreground py-12">
                <p>Testimonials will be shown here soon.</p>
            </div>
         )}
      </section>
    </div>
  );
}
