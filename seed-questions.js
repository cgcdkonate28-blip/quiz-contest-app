const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const questions = [
  {
    ordre: 1,
    texte: "Quel est le genre musical principal de Jonathan C. Gambela ?",
    optionA: "Rap",
    optionB: "Afrobeat",
    optionC: "Gospel",
    optionD: "Reggae",
    bonneReponse: "C",
    tempsImparti: 60,
  },
  {
    ordre: 2,
    texte: "Dans quelle ville de France Jonathan C. Gambela est-il ne ?",
    optionA: "Paris",
    optionB: "Montfermeil",
    optionC: "Lyon",
    optionD: "Marseille",
    bonneReponse: "B",
    tempsImparti: 60,
  },
  {
    ordre: 3,
    texte: "Quel est le titre de son premier album solo sorti en 2021 ?",
    optionA: "Un jour nouveau",
    optionB: "Mon coeur flechit",
    optionC: "Sabaoth",
    optionD: "Je t'adore",
    bonneReponse: "B",
    tempsImparti: 60,
  },
  {
    ordre: 4,
    texte: "En quelle annee Jonathan C. Gambela a-t-il lance sa carriere solo ?",
    optionA: "2015",
    optionB: "2018",
    optionC: "2020",
    optionD: "2022",
    bonneReponse: "C",
    tempsImparti: 60,
  },
  {
    ordre: 5,
    texte: "Avec qui Jonathan C. Gambela a-t-il fonde le groupe Mekaddishkem ?",
    optionA: "Fiston Mbuyi",
    optionB: "Dena Mwana",
    optionC: "Son frere Esdras Bantsimba",
    optionD: "Moise Mbiye",
    bonneReponse: "C",
    tempsImparti: 60,
  },
  {
    ordre: 6,
    texte: "Quel titre de Jonathan C. Gambela est extrait de l'album Mon coeur flechit ?",
    optionA: "Choix de Dieu",
    optionB: "Un jour nouveau",
    optionC: "Confident",
    optionD: "Ami eternel",
    bonneReponse: "A",
    tempsImparti: 60,
  },
  {
    ordre: 7,
    texte: "Combien de titres contient l'album Mon coeur flechit ?",
    optionA: "8",
    optionB: "10",
    optionC: "12",
    optionD: "15",
    bonneReponse: "B",
    tempsImparti: 60,
  },
  {
    ordre: 8,
    texte: "Dans quelle ville Jonathan C. Gambela a-t-il donne un concert au Palais de la Culture en mars 2024 ?",
    optionA: "Kinshasa",
    optionB: "Paris",
    optionC: "Abidjan",
    optionD: "Bruxelles",
    bonneReponse: "C",
    tempsImparti: 60,
  },
  {
    ordre: 9,
    texte: "Quel album Jonathan C. Gambela a-t-il sorti en 2024 ?",
    optionA: "Paradisio",
    optionB: "Mon coeur flechit",
    optionC: "Un jour nouveau",
    optionD: "Ambiance celeste",
    bonneReponse: "C",
    tempsImparti: 60,
  },
  {
    ordre: 10,
    texte: "Quel titre de Jonathan C. Gambela figure parmi ses chansons connues et populaires sur YouTube ?",
    optionA: "Sabaoth",
    optionB: "Nzambe na ngai",
    optionC: "Nzambe azali",
    optionD: "Nzambe na bomoyi",
    bonneReponse: "A",
    tempsImparti: 60,
  },
];

async function main() {
  for (const q of questions) {
    await prisma.question.create({ data: q });
  }
  console.log("Les 10 questions ont ete ajoutees avec succes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
