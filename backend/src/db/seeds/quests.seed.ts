import type { QuestEncounter } from "../../types/quest.types";

/**
 * Données de quêtes par défaut pour initialiser la base de données
 */
export const questsData = [
  {
    name: "La Forêt des Ombres",
    description:
      "Explorez la forêt mystérieuse et affrontez les créatures qui y rôdent. Une quête parfaite pour les débutants.",
    difficulty: 1,
    rewardExp: 100,
    rewardGold: 50,
    rewardItems: JSON.stringify([1, 3]), // Potion de soin et potion de mana
    boardSize: 10,
    encounters: JSON.stringify([
      {
        position: 2,
        type: "monster",
        data: {
          name: "Loup Sauvage",
          level: 1,
          description: "Un loup affamé qui rôde dans la forêt.",
        },
      },
      {
        position: 4,
        type: "treasure",
        data: {
          gold: 20,
          items: [1], // Potion de soin
        },
      },
      {
        position: 6,
        type: "rest",
        data: {
          healAmount: 20,
          description: "Une clairière paisible où vous pouvez vous reposer.",
        },
      },
      {
        position: 8,
        type: "monster",
        data: {
          name: "Bandit",
          level: 2,
          description: "Un brigand qui vous tend une embuscade.",
        },
      },
    ]),
  },
  {
    name: "Les Cavernes de Cristal",
    description:
      "Explorez les grottes scintillantes à la recherche de cristaux magiques. Attention aux créatures qui y vivent!",
    difficulty: 3,
    rewardExp: 250,
    rewardGold: 120,
    rewardItems: JSON.stringify([4, 5]), // Anneau de protection et amulette de force
    boardSize: 15,
    encounters: JSON.stringify([
      {
        position: 3,
        type: "monster",
        data: {
          name: "Chauve-souris Géante",
          level: 2,
          description: "Une énorme chauve-souris aux crocs acérés.",
        },
      },
      {
        position: 5,
        type: "trap",
        data: {
          name: "Piège à Fosse",
          damage: 15,
          description: "Un trou dissimulé dans le sol, bordé de piques.",
        },
      },
      {
        position: 8,
        type: "treasure",
        data: {
          gold: 50,
          items: [2, 3], // Potion de force et potion de mana
        },
      },
      {
        position: 10,
        type: "rest",
        data: {
          healAmount: 30,
          description: "Une petite source d'eau claire aux propriétés curatives.",
        },
      },
      {
        position: 13,
        type: "monster",
        data: {
          name: "Golem de Cristal",
          level: 4,
          description: "Un gardien minéral animé par magie.",
        },
      },
    ]),
  },
  {
    name: "Les Ruines Anciennes",
    description: "Explorez les vestiges d'une ancienne civilisation et découvrez ses secrets perdus.",
    difficulty: 5,
    rewardExp: 400,
    rewardGold: 200,
    rewardItems: JSON.stringify([6, 7]), // Épée enchantée et bouclier runique
    boardSize: 20,
    encounters: JSON.stringify([
      {
        position: 2,
        type: "trap",
        data: {
          name: "Dalle Piégée",
          damage: 20,
          description: "Une dalle qui déclenche une volée de flèches.",
        },
      },
      {
        position: 5,
        type: "monster",
        data: {
          name: "Squelette Guerrier",
          level: 3,
          description: "Les ossements animés d'un ancien guerrier.",
        },
      },
      {
        position: 8,
        type: "treasure",
        data: {
          gold: 80,
          items: [4], // Anneau de protection
        },
      },
      {
        position: 11,
        type: "rest",
        data: {
          healAmount: 40,
          description: "Un autel sacré qui restaure l'énergie vitale.",
        },
      },
      {
        position: 14,
        type: "monster",
        data: {
          name: "Gardien de Pierre",
          level: 5,
          description: "Une statue animée qui protège les ruines.",
        },
      },
      {
        position: 17,
        type: "monster",
        data: {
          name: "Nécromancien",
          level: 6,
          description: "Un mage noir qui commande les morts.",
        },
      },
    ]),
  },
  {
    name: "La Tour du Mage",
    description: "Escaladez la tour du sorcier maléfique et mettez fin à ses expériences néfastes.",
    difficulty: 7,
    rewardExp: 600,
    rewardGold: 350,
    rewardItems: JSON.stringify([8, 9]), // Bâton de pouvoir et robe enchantée
    boardSize: 25,
    encounters: JSON.stringify([
      {
        position: 3,
        type: "monster",
        data: {
          name: "Familier Corrompu",
          level: 4,
          description: "Une créature magique au service du mage noir.",
        },
      },
      {
        position: 6,
        type: "trap",
        data: {
          name: "Rune Explosive",
          damage: 30,
          description: "Un symbole magique qui explose quand on s'approche.",
        },
      },
      {
        position: 9,
        type: "monster",
        data: {
          name: "Golem d'Acier",
          level: 6,
          description: "Un gardien métallique animé par magie.",
        },
      },
      {
        position: 12,
        type: "rest",
        data: {
          healAmount: 50,
          description: "Une fontaine magique aux propriétés régénératrices.",
        },
      },
      {
        position: 15,
        type: "treasure",
        data: {
          gold: 150,
          items: [5, 10], // Amulette de force et grimoire ancien
        },
      },
      {
        position: 18,
        type: "monster",
        data: {
          name: "Démon Mineur",
          level: 7,
          description: "Une entité invoquée des plans infernaux.",
        },
      },
      {
        position: 22,
        type: "monster",
        data: {
          name: "Mage Noir",
          level: 8,
          description: "Le sorcier maléfique qui règne sur la tour.",
        },
      },
    ]),
  },
  {
    name: "Le Repaire du Dragon",
    description:
      "Brave le repaire d'un dragon ancien pour récupérer un artefact légendaire. Une quête pour les héros les plus courageux.",
    difficulty: 10,
    rewardExp: 1000,
    rewardGold: 500,
    rewardItems: JSON.stringify([11, 12]), // Armure draconique et épée légendaire
    boardSize: 30,
    encounters: JSON.stringify([
      {
        position: 3,
        type: "monster",
        data: {
          name: "Kobold",
          level: 5,
          description: "Un serviteur reptilien du dragon.",
        },
      },
      {
        position: 6,
        type: "trap",
        data: {
          name: "Fosse de Lave",
          damage: 40,
          description: "Une crevasse pleine de lave bouillonnante.",
        },
      },
      {
        position: 9,
        type: "monster",
        data: {
          name: "Drake de Feu",
          level: 7,
          description: "Un cousin mineur du dragon, cracheur de feu.",
        },
      },
      {
        position: 12,
        type: "treasure",
        data: {
          gold: 200,
          items: [13, 14], // Potion de résistance au feu et bouclier anti-dragon
        },
      },
      {
        position: 15,
        type: "rest",
        data: {
          healAmount: 60,
          description: "Un sanctuaire antique protégé de la chaleur du volcan.",
        },
      },
      {
        position: 18,
        type: "monster",
        data: {
          name: "Élémentaire de Feu",
          level: 8,
          description: "Une entité primordiale de flammes pures.",
        },
      },
      {
        position: 22,
        type: "trap",
        data: {
          name: "Geyser de Flammes",
          damage: 50,
          description: "Une éruption soudaine de feu et de lave.",
        },
      },
      {
        position: 26,
        type: "monster",
        data: {
          name: "Gardien du Trésor",
          level: 9,
          description: "Un golem géant qui protège l'accès à l'antre du dragon.",
        },
      },
      {
        position: 29,
        type: "monster",
        data: {
          name: "Dragon Ancien",
          level: 10,
          description: "Un dragon majestueux au sommet de sa puissance.",
        },
      },
    ]),
  },
];
