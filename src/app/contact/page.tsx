import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 md:px-6">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Get in Touch
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Have a project in mind or just want to say hello? Drop me a line.
        </p>
      </section>
      <section className="mt-12">
        <ContactForm />
      </section>
    </div>
  );
}
