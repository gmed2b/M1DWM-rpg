/**
 * Données d'items par défaut pour initialiser la base de données
 * Chaque item possède:
 * - name: Nom de l'item
 * - type: Type d'item (weapon, armor, consumable, accessory)
 * - price: Prix en or pour acheter l'item
 * - durability: Durabilité de l'item (points avant qu'il ne se brise)
 * - stats: Statistiques et bonus fournis par l'item
 */
export const itemsData = [
  // Weapons - Armes pour le combat au corps à corps ou à distance
  {
    name: "Dague rouillée",
    type: "weapon",
    price: 10,
    durability: 100,
    stats: { strength: 3, agility: 1 }, // Bonus de force et d'agilité
  },
  {
    name: "Épée courte",
    type: "weapon",
    price: 50,
    durability: 100,
    stats: { strength: 5, agility: 0 }, // Bonus de force
  },
  {
    name: "Hache de guerre",
    type: "weapon",
    price: 120,
    durability: 100,
    stats: { strength: 8, agility: -1 }, // Bonus de force, malus d'agilité
  },
  {
    name: "Arc long",
    type: "weapon",
    price: 80,
    durability: 100,
    stats: { agility: 4, strength: 3 }, // Bonus d'agilité et de force
  },
  {
    name: "Bâton de mage",
    type: "weapon",
    price: 65,
    durability: 100,
    stats: { magic: 6, strength: 1 }, // Bonus de magie et de force
  },
  {
    name: "Épée légendaire",
    type: "weapon",
    price: 500,
    durability: 150,
    stats: { strength: 12, agility: 3, luck: 2 }, // Bonus de force, d'agilité et de chance
  },
  {
    name: "Bâton de feu",
    type: "weapon",
    price: 350,
    durability: 90,
    stats: { magic: 10, strength: 2 }, // Bonus de magie et de force
  },
  {
    name: "Dagues jumelles",
    type: "weapon",
    price: 300,
    durability: 80,
    stats: { agility: 8, speed: 5, strength: 4 }, // Bonus d'agilité, de vitesse et de force
  },
  {
    name: "Marteau de guerre",
    type: "weapon",
    price: 200,
    durability: 120,
    stats: { strength: 10, speed: -2 }, // Bonus de force, malus de vitesse
  },
  {
    name: "Sceptre de puissance",
    type: "weapon",
    price: 450,
    durability: 100,
    stats: { magic: 12, charisma: 3 }, // Bonus de magie et de charisme
  },

  // Armor - Armures pour la protection
  {
    name: "Armure de cuir",
    type: "armor",
    price: 45,
    durability: 80,
    stats: { agility: 2, strength: 1 }, // Bonus d'agilité et de force
  },
  {
    name: "Cotte de mailles",
    type: "armor",
    price: 120,
    durability: 120,
    stats: { strength: 3, agility: -1 }, // Bonus de force, malus d'agilité
  },
  {
    name: "Armure de plaques",
    type: "armor",
    price: 250,
    durability: 150,
    stats: { strength: 5, agility: -2, speed: -1 }, // Bonus de force, malus d'agilité et de vitesse
  },
  {
    name: "Robe de mage",
    type: "armor",
    price: 100,
    durability: 70,
    stats: { magic: 5, charisma: 2 }, // Bonus de magie et de charisme
  },
  {
    name: "Cape d'ombre",
    type: "armor",
    price: 180,
    durability: 60,
    stats: { agility: 4, speed: 3, luck: 2 }, // Bonus d'agilité, de vitesse et de chance
  },
  {
    name: "Armure enchantée",
    type: "armor",
    price: 400,
    durability: 130,
    stats: { strength: 4, magic: 4, charisma: 2 }, // Bonus de force, de magie et de charisme
  },
  {
    name: "Heaume de vaillance",
    type: "armor",
    price: 150,
    durability: 100,
    stats: { strength: 2, charisma: 3 }, // Bonus de force et de charisme
  },
  {
    name: "Bouclier de dragon",
    type: "armor",
    price: 320,
    durability: 200,
    stats: { strength: 6, speed: -1 }, // Bonus de force, malus de vitesse
  },

  // Potions and consumables - Potions et consommables pour des effets temporaires
  {
    name: "Potion de vie",
    type: "consumable",
    price: 25,
    durability: 100,
    stats: { health: 50 }, // Restauration de points de vie
  },
  {
    name: "Élixir de mana",
    type: "consumable",
    price: 30,
    durability: 100,
    stats: { magic: 50 }, // Restauration de points de magie
  },
  {
    name: "Potion de force",
    type: "consumable",
    price: 40,
    durability: 100,
    stats: { strength: 5, duration: 3 }, // Bonus temporaire de force
  },
  {
    name: "Potion d'agilité",
    type: "consumable",
    price: 40,
    durability: 100,
    stats: { agility: 5, duration: 3 }, // Bonus temporaire d'agilité
  },
  {
    name: "Antidote",
    type: "consumable",
    price: 15,
    durability: 100,
    stats: { curePoison: true }, // Soigne les empoisonnements
  },
  {
    name: "Pain elfique",
    type: "consumable",
    price: 10,
    durability: 100,
    stats: { health: 20 }, // Restauration de points de vie
  },
  {
    name: "Potion de chance",
    type: "consumable",
    price: 60,
    durability: 100,
    stats: { luck: 5, duration: 5 }, // Bonus temporaire de chance
  },

  // Miscellaneous items - Objets divers pour des bonus passifs
  {
    name: "Amulette du pouvoir",
    type: "accessory",
    price: 200,
    durability: 100,
    stats: { magic: 3, charisma: 2 }, // Bonus de magie et de charisme
  },
  {
    name: "Anneau de vie",
    type: "accessory",
    price: 150,
    durability: 100,
    stats: { health: 15 }, // Augmentation des points de vie
  },
  {
    name: "Bottes rapides",
    type: "accessory",
    price: 120,
    durability: 90,
    stats: { speed: 5, agility: 2 }, // Bonus de vitesse et d'agilité
  },
  {
    name: "Gants de force",
    type: "accessory",
    price: 100,
    durability: 80,
    stats: { strength: 3 }, // Bonus de force
  },
  {
    name: "Porte-bonheur",
    type: "accessory",
    price: 80,
    durability: 100,
    stats: { luck: 4 }, // Bonus de chance
  },
];
