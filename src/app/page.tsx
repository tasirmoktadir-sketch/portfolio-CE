import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="container mx-auto px-4 py-12 md:px-6">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Video Gallery
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          A collection of my recent video projects. Each piece showcases a unique story and visual style.
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
  );
}
