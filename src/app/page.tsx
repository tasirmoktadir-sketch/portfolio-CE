import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const videoProjects = [
  {
    id: "1",
    title: "Project Alpha",
    description: "A short film exploring the depths of human emotion.",
    embedId: "dQw4w9WgXcQ",
  },
  {
    id: "2",
    title: "Project Beta",
    description: "An adventurous journey through unseen landscapes.",
    embedId: "QH2-TGUlwu4",
  },
  {
    id: "3",
    title: "Project Gamma",
    description: "Music video for an up and coming artist.",
    embedId: "YddwkMJG1Jo",
  },
  {
    id: "4",
    title: "Project Delta",
    description: "A commercial that captures the essence of the brand.",
    embedId: "3tmd-ClpJxA",
  },
  {
    id: "5",
    title: "Project Epsilon",
    description: "Documentary on the life of urban wildlife.",
    embedId: "y6120QOlsfU",
  },
  {
    id: "6",
    title: "Project Zeta",
    description: "Experimental piece using innovative camera techniques.",
    embedId: "V-_O7nl0Ii0",
  },
];

export default function Home() {
  return (
    <>
      <section className="container mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="mb-4 inline-block rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          Cinematic Edge
        </div>
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          Mohtasim Moktadir Tasir
        </h1>
        <p className="mt-4 text-xl font-medium text-muted-foreground">
          Video Editor & Content Creator
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Creating engaging short-form content and compelling commercials that captivate audiences and elevate brands.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild>
            <Link href="/contact">
              Contact Us <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="#featured-work">
              View Work
            </Link>
          </Button>
        </div>
      </section>

      <div id="featured-work" className="container mx-auto px-4 py-12 md:px-6 scroll-m-20">
        <section className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Featured Work
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            A selection of recent projects showcasing commercial ads and social media content.
          </p>
        </section>

        <section className="mt-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {videoProjects.map((video) => (
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
        </section>
      </div>
    </>
  );
}
