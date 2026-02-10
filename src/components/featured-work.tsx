"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

type VideoProject = {
  id: string;
  title: string;
  description: string;
  embedId: string;
};

export function FeaturedWork() {
  const firestore = useFirestore();
  const { data: videoProjects, loading } = useCollection<VideoProject>(
    firestore ? collection(firestore, 'videoProjects') : null
  );

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
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {videoProjects?.map((video) => (
        <Card key={video.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <CardContent className="p-0">
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${video.embedId}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </CardContent>
          <CardHeader>
            <CardTitle>{video.title}</CardTitle>
            <CardDescription>{video.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
