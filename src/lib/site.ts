export const SITE = {
  name: "Manvinder Singh Enterprises",
  shortName: "MSE",
  tagline: "Cattle Feed & Dairy Logistics",
  location: "Chittorgarh, Rajasthan — 312001",
  gstin: "08FCAPS3631E1ZP",
  phones: {
    primary: { display: "+91 94622 06662", tel: "+919462206662", wa: "919462206662" },
    secondary: { display: "+91 95495 72999", tel: "+919549572999" },
  },
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/products", label: "Dairy Products" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
] as const;
