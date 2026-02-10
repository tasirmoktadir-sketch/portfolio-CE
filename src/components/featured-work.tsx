"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type VideoProject = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  storagePath: string;
  category: string;
};

export function FeaturedWork() {
  const firestore = useFirestore();
  const { data: videoProjects, loading } = useCollection<VideoProject>(
    firestore ? collection(firestore, 'videoProjects') : null
  );

  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const categories = React.useMemo(() => {
    if (!videoProjects) return ['All'];
    const uniqueCategories = new Set(videoProjects.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(uniqueCategories)];
  }, [videoProjects]);

  const filteredVideos = React.useMemo(() => {
    if (!videoProjects) return [];
    if (selectedCategory === 'All') return videoProjects;
    return videoProjects.filter(video => video.category === selectedCategory);
  }, [videoProjects, selectedCategory]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-0">
                <Skeleton className="h-full w-full aspect-video" />
            </CardContent>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {categories.length > 1 && (
        <div className="flex justify-center mb-8">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
                <TabsList>
                    {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                        {category}
                    </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardContent className="p-0">
              <div className="aspect-video bg-black">
                <video
                  className="h-full w-full"
                  src={video.videoUrl}
                  controls
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </CardContent>
            <CardHeader>
              <CardTitle>{video.title}</CardTitle>
              <CardDescription>{video.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

       {(!loading && videoProjects && videoProjects.length > 0 && filteredVideos.length === 0) && (
          <div className="text-center text-muted-foreground py-12 col-span-full">
              <p>There are no videos in this category yet.</p>
          </div>
       )}
        {(!loading && (!videoProjects || videoProjects.length === 0)) && (
            <div className="text-center text-muted-foreground py-12 col-span-full">
                <p>No videos have been uploaded yet. Check back soon!</p>
            </div>
        )}
    </>
  );
}
