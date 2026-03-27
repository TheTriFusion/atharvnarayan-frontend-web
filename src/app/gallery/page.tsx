import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos of cattle feed, branding, and dairy logistics operations.",
};

const shots = [
  {
    src: "/images/feed-brand.jpeg",
    alt: "Saras Gold cattle feed and branding",
    caption: "Feed brands & quality pellets",
  },
  {
    src: "/images/banner-alt.jpeg",
    alt: "Manvinder Singh Enterprises promotional creative",
    caption: "Promotional creative",
  },
  {
    src: "/images/split-hero.jpeg",
    alt: "Split hero — feed and logistics",
    caption: "Feed & logistics story",
  },
  {
    src: "/images/corporate-flyer.jpeg",
    alt: "Corporate flyer — dairy and feed",
    caption: "Corporate overview",
  },
] as const;

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Visual snapshot"
        subtitle="A quick look at our feed brands, creatives, and dairy logistics presence."
      />
      <section className="bg-cream px-4 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2">
          {shots.map((s) => (
            <figure
              key={s.src}
              className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-navy/10"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <figcaption className="px-4 py-3 text-center text-sm font-semibold text-navy">
                {s.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
