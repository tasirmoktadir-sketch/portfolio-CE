import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FeaturedWork } from "@/components/featured-work";

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
          <FeaturedWork />
        </section>
      </div>
    </>
  );
}
