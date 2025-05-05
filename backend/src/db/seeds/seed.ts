/**
 * Script pour initialiser la base de données avec des données de test
 * Ce script appelle les méthodes de seed pour remplir les tables:
 * - Items: Armes, armures, consommables, accessoires
 * - Monstres: Créatures de différents niveaux de difficulté
 * - Quêtes: Aventures avec rencontres et récompenses
 */
import { ItemService } from "../../services/item.service";
import { MonsterService } from "../../services/monster.service";
import { QuestService } from "../../services/quest.service";

/**
 * Fonction principale pour initialiser toutes les données
 */
export async function seedDatabase() {
  try {
    console.log("Démarrage de l'initialisation de la base de données...");

    // Initialiser les items (armes, armures, potions, etc.)
    const itemCount = await ItemService.seedItems();
    console.log(`✅ ${itemCount} items ajoutés avec succès`);

    // Initialiser les monstres
    const monsterCount = await MonsterService.seedMonsters();
    console.log(`✅ ${monsterCount} monstres ajoutés avec succès`);

    // Initialiser les quêtes
    const questCount = await QuestService.seedQuests();
    console.log(`✅ ${questCount} quêtes ajoutées avec succès`);

    console.log("✨ Base de données initialisée avec succès!");
    return { items: itemCount, monsters: monsterCount, quests: questCount };
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la base de données:", error);
    throw error;
  }
}

// Si ce fichier est exécuté directement, lancer l'initialisation
if (import.meta.main) {
  seedDatabase()
    .then((result) => {
      console.log("Résumé de l'initialisation:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Échec de l'initialisation:", error);
      process.exit(1);
    });
}
