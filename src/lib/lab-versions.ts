export const LAB_VERSIONS = [
  {
    slug: "mesa",
    title: "Mesa do contador",
    blurb: "Papel kraft, caderno e carimbo. A foto manuscrita e a estrela.",
    ink: "#3a2618",
    paper: "#e8d2b0",
  },
  {
    slug: "carne",
    title: "Carne / boleto",
    blurb: "Formulario brasileiro, picote e codigo de barras.",
    ink: "#1a3358",
    paper: "#d7e4f2",
  },
  {
    slug: "scanner",
    title: "Scanner / xerox",
    blurb: "Luz fria, linha de scan, documento na vidraca.",
    ink: "#141414",
    paper: "#e8ead4",
  },
  {
    slug: "carimbo",
    title: "Carimbo CONFERIDO",
    blurb: "Verde da marca no talo. O saldo fecha com um carimbo.",
    ink: "#f3efe4",
    paper: "#0F6B5C",
  },
] as const;

export type LabSlug = (typeof LAB_VERSIONS)[number]["slug"];

export function getLabVersion(slug: string) {
  return LAB_VERSIONS.find((version) => version.slug === slug);
}
