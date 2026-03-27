import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Manvinder Singh Enterprises — trusted cattle feed and dairy logistics partner in Chittorgarh & Bhilwara.",
};

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm ring-1 ring-navy/5">
      <h3 className="text-lg font-extrabold uppercase tracking-wide text-navy">
        {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-navy/80">{children}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Manvinder Singh Enterprises"
        subtitle="A recognized trader and service provider in animal nutrition and dairy logistics — rooted in Chittorgarh & Bhilwara, Rajasthan."
      />
      <section className="bg-cream px-4 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          <Card title="Who we are">
            <p>
              We combine dependable cattle feed trading with hands-on dairy
              logistics — from city milk supply routes to trained manpower at
              plants and collection points. Our work spans well-known feed
              brands and active dairy operations including Saras Dairy,
              Rajasthan.
            </p>
          </Card>
          <Card title="Where we operate">
            <p>
              Primary operations across Chittorgarh, Bhilwara, and the wider
              Rajasthan corridor — with tanker logistics extending to
              Maharashtra and other states through Rao Milk transportation
              partnerships.
            </p>
          </Card>
          <Card title="Why clients choose us">
            <ul className="list-inside list-disc space-y-2">
              <li>Consistent feed quality and timely bulk delivery</li>
              <li>Experienced tanker and plant manpower</li>
              <li>Transparent dealing and long-term relationships</li>
            </ul>
          </Card>
          <Card title="Our promise">
            <p>
              <strong className="text-navy">Quality feed. Better yield.</strong>{" "}
              Reliable logistics and support — so your herd and your dairy
              routes stay productive.
            </p>
          </Card>
        </div>
      </section>
    </>
  );
}
