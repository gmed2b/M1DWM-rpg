import { Stat } from "../../game/models/Stat";

/**
 * Données de monstres par défaut pour initialiser la base de données
 * Chaque monstre possède:
 * - name: Nom du monstre
 * - level: Niveau de difficulté du monstre
 * - description: Description du monstre
 * - health: Points de vie du monstre
 * - stats: Statistiques du monstre (force, magie, agilité, vitesse, charisme, chance)
 * - imageUrl: Chemin vers l'image du monstre pour l'affichage
 *
 * Les monstres sont organisés par niveaux de difficulté:
 * - Niveau 1-3: Monstres débutants pour les premiers combats
 * - Niveau 4-6: Monstres intermédiaires avec plus de puissance
 * - Niveau 7-9: Monstres avancés représentant un défi important
 * - Niveau 10: Boss finaux, très puissants
 */
export const monstersData = [
  // Niveau 1-3 (Débutant)
  {
    name: "Loup Sauvage",
    level: 1,
    description: "Un loup affamé qui rôde dans la forêt.",
    health: 30,
    stats: JSON.stringify({
      strength: 3,
      magic: 1,
      agility: 4,
      speed: 5,
      charisma: 1,
      luck: 2,
    }),
    imageUrl: "/assets/monsters/wolf.png",
  },
  {
    name: "Bandit",
    level: 2,
    description: "Un brigand qui tend des embuscades aux voyageurs imprudents.",
    health: 40,
    stats: JSON.stringify({
      strength: 4,
      magic: 1,
      agility: 3,
      speed: 4,
      charisma: 2,
      luck: 2,
    }),
    imageUrl: "/assets/monsters/bandit.png",
  },
  {
    name: "Chauve-souris Géante",
    level: 2,
    description: "Une énorme chauve-souris aux crocs acérés.",
    health: 25,
    stats: JSON.stringify({
      strength: 2,
      magic: 1,
      agility: 6,
      speed: 7,
      charisma: 1,
      luck: 3,
    }),
    imageUrl: "/assets/monsters/bat.png",
  },
  {
    name: "Kobold",
    level: 3,
    description: "Une petite créature reptilienne rusée et vicieuse.",
    health: 35,
    stats: JSON.stringify({
      strength: 3,
      magic: 2,
      agility: 5,
      speed: 4,
      charisma: 1,
      luck: 3,
    }),
    imageUrl: "/assets/monsters/kobold.png",
  },

  // Niveau 4-6 (Intermédiaire)
  {
    name: "Squelette Guerrier",
    level: 4,
    description: "Les ossements animés d'un ancien guerrier.",
    health: 45,
    stats: JSON.stringify({
      strength: 5,
      magic: 1,
      agility: 3,
      speed: 3,
      charisma: 1,
      luck: 2,
    }),
    imageUrl: "/assets/monsters/skeleton.png",
  },
  {
    name: "Golem de Cristal",
    level: 5,
    description: "Un gardien minéral animé par magie.",
    health: 65,
    stats: JSON.stringify({
      strength: 6,
      magic: 4,
      agility: 2,
      speed: 2,
      charisma: 1,
      luck: 2,
    }),
    imageUrl: "/assets/monsters/crystal_golem.png",
  },
  {
    name: "Familier Corrompu",
    level: 4,
    description: "Une créature magique au service des forces sombres.",
    health: 40,
    stats: JSON.stringify({
      strength: 3,
      magic: 6,
      agility: 5,
      speed: 4,
      charisma: 2,
      luck: 3,
    }),
    imageUrl: "/assets/monsters/familiar.png",
  },
  {
    name: "Gardien de Pierre",
    level: 6,
    description: "Une statue animée qui protège les ruines.",
    health: 80,
    stats: JSON.stringify({
      strength: 8,
      magic: 2,
      agility: 1,
      speed: 1,
      charisma: 1,
      luck: 2,
    }),
    imageUrl: "/assets/monsters/stone_guardian.png",
  },

  // Niveau 7-9 (Avancé)
  {
    name: "Nécromancien",
    level: 7,
    description: "Un mage noir qui commande les morts.",
    health: 60,
    stats: JSON.stringify({
      strength: 3,
      magic: 9,
      agility: 4,
      speed: 3,
      charisma: 5,
      luck: 4,
    }),
    imageUrl: "/assets/monsters/necromancer.png",
  },
  {
    name: "Golem d'Acier",
    level: 7,
    description: "Un gardien métallique animé par magie avancée.",
    health: 100,
    stats: JSON.stringify({
      strength: 10,
      magic: 3,
      agility: 2,
      speed: 2,
      charisma: 1,
      luck: 2,
    }),
    imageUrl: "/assets/monsters/steel_golem.png",
  },
  {
    name: "Démon Mineur",
    level: 8,
    description: "Une entité invoquée des plans infernaux.",
    health: 85,
    stats: JSON.stringify({
      strength: 7,
      magic: 7,
      agility: 6,
      speed: 5,
      charisma: 4,
      luck: 3,
    }),
    imageUrl: "/assets/monsters/demon.png",
  },
  {
    name: "Drake de Feu",
    level: 8,
    description: "Un cousin mineur du dragon, cracheur de feu.",
    health: 110,
    stats: JSON.stringify({
      strength: 8,
      magic: 7,
      agility: 5,
      speed: 6,
      charisma: 3,
      luck: 3,
    }),
    imageUrl: "/assets/monsters/fire_drake.png",
  },
  {
    name: "Élémentaire de Feu",
    level: 9,
    description: "Une entité primordiale de flammes pures.",
    health: 90,
    stats: JSON.stringify({
      strength: 6,
      magic: 10,
      agility: 7,
      speed: 7,
      charisma: 3,
      luck: 4,
    }),
    imageUrl: "/assets/monsters/fire_elemental.png",
  },
  {
    name: "Gardien du Trésor",
    level: 9,
    description: "Un golem géant qui protège des trésors millénaires.",
    health: 130,
    stats: JSON.stringify({
      strength: 12,
      magic: 5,
      agility: 3,
      speed: 3,
      charisma: 2,
      luck: 3,
    }),
    imageUrl: "/assets/monsters/treasure_guardian.png",
  },

  // Niveau 10 (Boss)
  {
    name: "Mage Noir",
    level: 10,
    description: "Un sorcier maléfique au sommet de sa puissance.",
    health: 120,
    stats: JSON.stringify({
      strength: 6,
      magic: 14,
      agility: 8,
      speed: 7,
      charisma: 8,
      luck: 5,
    }),
    imageUrl: "/assets/monsters/dark_mage.png",
  },
  {
    name: "Dragon Ancien",
    level: 10,
    description: "Un dragon majestueux au sommet de sa puissance.",
    health: 200,
    stats: JSON.stringify({
      strength: 15,
      magic: 12,
      agility: 8,
      speed: 7,
      charisma: 10,
      luck: 5,
    }),
    imageUrl: "/assets/monsters/ancient_dragon.png",
  },
];
