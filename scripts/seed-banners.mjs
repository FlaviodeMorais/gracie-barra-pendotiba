import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const absPath = path.join(ROOT, "dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:///${absPath}` });
const prisma = new PrismaClient({ adapter });

const banners = [
  {
    imageUrl: "/uploads/snapins-ai_3488398622310481648.jpg",
    title: "Nossa Equipe",
    description: "Gracie Barra Pendotiba — Campeões dentro e fora do tatame",
    order: 1,
    active: true,
  },
  {
    imageUrl: "/uploads/snapins-ai_3488398622360646827.jpg",
    title: "Futuros Atletas",
    description: "Formando campeões desde cedo — programa infantil GB Pendotiba",
    order: 2,
    active: true,
  },
  {
    imageUrl: "/uploads/snapins-ai_3481615851033622266.jpg",
    title: "Aprenda com os Melhores",
    description: "Instrutores certificados Gracie Barra para todas as idades",
    order: 3,
    active: true,
  },
  {
    imageUrl: "/uploads/snapins-ai_3488398622310511908.jpg",
    title: "Programa Feminino",
    description: "Jiu-Jitsu para mulheres — ambiente seguro e acolhedor",
    order: 4,
    active: true,
  },
  {
    imageUrl: "/uploads/snapins-ai_3425070173961688670.jpg",
    title: "Treine Jiu-Jitsu",
    description: "Técnica, disciplina e evolução constante",
    order: 5,
    active: true,
  },
  {
    imageUrl: "/uploads/snapins-ai_3488398622310429451.jpg",
    title: "Medalhas & Conquistas",
    description: "Nossa equipe brilha nos campeonatos",
    order: 6,
    active: true,
  },
];

await prisma.banner.deleteMany();
const result = await prisma.banner.createMany({ data: banners });
console.log(`✓ ${result.count} banners cadastrados!`);

await prisma.$disconnect();
