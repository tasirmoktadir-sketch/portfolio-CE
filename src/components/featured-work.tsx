'use client';

import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useMemo } from 'react';

type VideoProject = {
  id: string;
  title: string;
  description: string;
  youtubeEmbedId: string;
  category: string;
};

function VideoCarousel({ category }: { category: string }) {
  const firestore = useFirestore();
  const videoProjectsCollection = firestore ? collection(firestore, 'videoProjects') : null;
  
  const videoQuery = useMemo(() => {
    if (!videoProjectsCollection) return null;
    if (category === 'all') {
      return query(videoProjectsCollection);
    }
    return query(videoProjectsCollection, where('category', '==', category));
  }, [videoProjectsCollection, category]);

  const { data: videoProjects, loading } = useCollection<VideoProject>(videoQuery);

  if (loading) {
    return (
      <div className="flex space-x-4 overflow-hidden p-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="min-w-0 shrink-0 grow-0 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 space-y-2">
            <Skeleton className="aspect-[9/16] w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: (videoProjects?.length || 0) > 5,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {videoProjects?.map(video => (
          <CarouselItem
            key={video.id}
            className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 pl-4"
          >
            <div className="p-1">
              <Card className="overflow-hidden border-0 bg-transparent shadow-lg shadow-primary/10 hover:shadow-primary/30 transition-shadow duration-300 rounded-lg">
                <CardContent className="p-0">
                  <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${video.youtubeEmbedId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </CardContent>
                <CardFooter className="p-2 pt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground text-center w-full">
                    {video.title}
                  </h3>
                </CardFooter>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="text-foreground bg-foreground/10 hover:bg-foreground/20 border-foreground/20" />
      <CarouselNext className="text-foreground bg-foreground/10 hover:bg-foreground/20 border-foreground/20" />
    </Carousel>
  );
}

export function FeaturedWork() {
    const firestore = useFirestore();
    const { data: videoProjects } = useCollection<VideoProject>(
        firestore ? collection(firestore, 'videoProjects') : null
    );

    const categories = useMemo(() => {
        if (!videoProjects) return [];
        const uniqueCategories = new Set(videoProjects.map(v => v.category).filter(Boolean));
        if (uniqueCategories.size === 0) return [];
        return ['all', ...Array.from(uniqueCategories)];
    }, [videoProjects]);

    if (categories.length === 0) {
      return (
        <VideoCarousel category="all" />
      )
    }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-3 md:w-1/2 lg:w-1/3 mx-auto">
         {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">{category}</TabsTrigger>
         ))}
      </TabsList>
        {categories.map(category => (
             <TabsContent key={category} value={category} className="pt-8">
                <VideoCarousel category={category} />
            </TabsContent>
        ))}
    </Tabs>
  );
}
