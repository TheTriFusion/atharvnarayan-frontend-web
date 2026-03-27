import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[55vh] flex-col items-center justify-center bg-cream px-4 py-20 text-center">
      <p className="text-8xl font-black leading-none text-navy/10 sm:text-9xl md:text-[10rem]">
        404
      </p>
      <h1 className="-mt-10 text-2xl font-extrabold uppercase text-navy sm:-mt-14 md:-mt-16 md:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm text-navy/70">
        This page doesn&apos;t exist. Try the home page or contact us for help.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-navy px-8 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg transition hover:bg-navy-deep"
      >
        Back to home
      </Link>
    </main>
  );
}
