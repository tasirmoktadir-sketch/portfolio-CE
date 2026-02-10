import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const skills = [
  "Videography", "Cinematography", "Video Editing", "Color Grading",
  "Directing", "Storytelling", "Adobe Premiere Pro", "DaVinci Resolve",
  "After Effects", "Motion Graphics", "Drone Operation", "Sound Design"
];

export default function AboutPage() {
  const profileImage = PlaceHolderImages.find(p => p.id === 'profile-picture');

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 md:px-6">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          About Me
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Director, Cinematographer, and Editor.
        </p>
      </section>

      <section className="mt-12">
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="grid items-center gap-8 md:grid-cols-3">
              <div className="flex justify-center md:col-span-1">
                {profileImage && (
                  <Image
                    src={profileImage.imageUrl}
                    alt={profileImage.description}
                    data-ai-hint={profileImage.imageHint}
                    width={200}
                    height={200}
                    className="rounded-full object-cover aspect-square shadow-md"
                  />
                )}
              </div>
              <div className="md:col-span-2 space-y-4">
                <h2 className="text-3xl font-semibold tracking-tight">Mohtasim Moktadir Tasir</h2>
                <p className="text-muted-foreground">
                  I'm a passionate filmmaker with a keen eye for storytelling and visual aesthetics. My journey in the cinematic world has been driven by a desire to capture moments that resonate and tell stories that matter. From directing short films to crafting compelling commercial content, I thrive on the creative process and the collaboration it entails.
                </p>
                <p className="text-muted-foreground">
                  My expertise lies in transforming ideas into visually stunning narratives. I believe that every frame has a purpose, and I meticulously work to ensure that every project I undertake is not just seen, but felt.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>My Skillset</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-sm cursor-default bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
