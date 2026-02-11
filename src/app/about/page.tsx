"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDoc, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type AboutInfo = {
  name: string;
  tagline: string;
  bio1: string;
  bio2: string;
  profileImageUrl: string;
  skills: string[];
};

export default function AboutPage() {
  const firestore = useFirestore();
  const aboutDocRef = firestore ? doc(firestore, "siteContent", "about") : null;
  const { data: aboutInfo, loading } = useDoc<AboutInfo>(aboutDocRef);
  const profilePicture = PlaceHolderImages.find(p => p.id === 'profile-picture');

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:px-6">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          About Me
        </h1>
        {loading ? (
           <Skeleton className="h-7 w-1/2 mx-auto mt-4" />
        ) : (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {aboutInfo?.tagline}
          </p>
        )}
      </section>

      <section className="mt-12">
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
             {loading ? (
              <div className="grid items-center gap-8 md:grid-cols-3">
                <div className="flex justify-center md:col-span-1">
                  <Skeleton className="h-[200px] w-[200px] rounded-full" />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <Skeleton className="h-9 w-3/4" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                   <Skeleton className="h-5 w-4/5" />
                </div>
              </div>
            ) : aboutInfo ? (
              <div className="grid items-center gap-8 md:grid-cols-3">
                <div className="flex justify-center md:col-span-1">
                    <Image
                      src={profilePicture?.imageUrl || ''}
                      alt={aboutInfo.name}
                      width={200}
                      height={200}
                      className="rounded-full object-cover aspect-square shadow-md"
                      data-ai-hint={profilePicture?.imageHint}
                    />
                </div>
                <div className="md:col-span-2 space-y-4">
                  <h2 className="text-3xl font-semibold tracking-tight">{aboutInfo.name}</h2>
                  <p className="text-muted-foreground">{aboutInfo.bio1}</p>
                  <p className="text-muted-foreground">{aboutInfo.bio2}</p>
                </div>
              </div>
            ) : <p>About information not available.</p>}
          </CardContent>
        </Card>
      </section>
      
      <section className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>My Skillset</CardTitle>
          </CardHeader>
          <CardContent>
             {loading ? (
                <div className="flex flex-wrap gap-2">
                    {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-6 w-24" />)}
                </div>
             ) : (
                <div className="flex flex-wrap gap-2">
                  {aboutInfo?.skills?.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-sm cursor-default bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      {skill}
                    </Badge>
                  ))}
                </div>
             )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
