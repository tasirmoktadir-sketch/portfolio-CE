"use client";

import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase } from "lucide-react";

type Service = {
  id: string;
  title: string;
  description: string;
};

export default function ServicesPage() {
  const firestore = useFirestore();
  const servicesCollection = firestore ? collection(firestore, "services") : null;
  const { data: services, loading } = useCollection<Service>(servicesCollection);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:px-6">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Services
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          A brief overview of the professional services I offer to bring your creative vision to life.
        </p>
      </section>
      <section className="mt-12">
        {loading ? (
          <div className="grid gap-8 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {services?.map((service) => (
              <Card key={service.id}>
                 <CardHeader className="flex flex-row items-center gap-4">
                  <Briefcase className="w-8 h-8 text-primary" />
                  <CardTitle className="mb-0">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
         {(!loading && services?.length === 0) && (
            <div className="text-center text-muted-foreground py-12">
                <p>Services will be listed here soon.</p>
            </div>
         )}
      </section>
    </div>
  );
}
