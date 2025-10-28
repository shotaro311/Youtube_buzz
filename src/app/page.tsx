import { SearchShell } from "@/components/search-shell";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-sky-50 via-white to-white">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 pb-16 pt-12 sm:px-10 lg:px-16">
        <header className="flex flex-col gap-4 rounded-3xl bg-white/80 p-8 shadow-sm ring-1 ring-sky-100 backdrop-blur">
          <p className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Youtubeリサーチツールv1.0
          </p>
        </header>

        <section>
          <SearchShell />
        </section>
      </main>
    </div>
  );
}
