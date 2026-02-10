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
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

type VideoProject = {
  id: string;
  title: string;
  description: string;
  youtubeEmbedId: string;
  category: string;
};

export function FeaturedWork() {
  const firestore = useFirestore();
  const { data: videoProjects, loading } = useCollection<VideoProject>(
    firestore ? collection(firestore, 'videoProjects') : null
  );

  if (loading) {
    return (
      <div className="flex space-x-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="min-w-0 shrink-0 grow-0 basis-1/3">
            <Skeleton className="h-full w-full aspect-video rounded-lg" />
            <Skeleton className="h-6 w-3/4 mt-4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: 'start',
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-4">
        {videoProjects?.map(video => (
          <CarouselItem
            key={video.id}
            className="md:basis-1/2 lg:basis-1/3 pl-4"
          >
            <div className="p-1">
              <Card className="overflow-hidden border-0 bg-transparent shadow-lg shadow-primary/10 hover:shadow-primary/30 transition-shadow duration-300 rounded-lg">
                <CardContent className="p-0">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
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
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white text-center w-full">
                    {video.title}
                  </h3>
                </CardFooter>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="text-white bg-white/10 hover:bg-white/20 border-white/20" />
      <CarouselNext className="text-white bg-white/10 hover:bg-white/20 border-white/20" />
    </Carousel>
  );
}
