export function Footer() {
  return (
    <footer className="border-t bg-secondary">
      <div className="container flex flex-col items-center justify-center gap-4 py-8 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-secondary-foreground md:text-left">
            Built by{" "}
            <a
              href="https://github.com/mohtasim-tasir"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Mohtasim Moktadir Tasir
            </a>
            . The source code is available on GitHub.
          </p>
        </div>
      </div>
    </footer>
  );
}
