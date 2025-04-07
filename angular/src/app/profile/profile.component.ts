import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface User {
  id: string;
  username: string;
  avatar?: string;
  joinDate: Date;
  lastLogin: Date;
  stats?: {
    completedQuests: number;
    victories: number;
    totalGold: number;
    playTime: number; // en minutes
  };
}

interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  isActive: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  characters: Character[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Simulation de données utilisateur
    this.loadUserData();
    this.loadCharacters();
  }

  loadUserData(): void {
    // Dans un cas réel, ceci viendrait d'un service d'authentification
    this.user = {
      id: '1',
      username: 'Eldrin',
      avatar: 'assets/avatars/wizard.png',
      joinDate: new Date(2023, 0, 15),
      lastLogin: new Date(),
      stats: {
        completedQuests: 24,
        victories: 78,
        totalGold: 1450,
        playTime: 1840, // minutes
      },
    };
  }

  loadCharacters(): void {
    // Dans un cas réel, ceci viendrait d'un service de personnages
    this.characters = [
      {
        id: '1',
        name: 'Gandalf',
        class: 'Mage',
        level: 5,
        isActive: true,
      },
      {
        id: '2',
        name: 'Aragorn',
        class: 'Guerrier',
        level: 7,
        isActive: false,
      },
      {
        id: '3',
        name: 'Legolas',
        class: 'Archer',
        level: 6,
        isActive: false,
      },
    ];
  }

  getClassIcon(characterClass: string): string {
    // Retourne l'icône CSS correspondant à la classe
    switch (characterClass.toLowerCase()) {
      case 'mage':
        return 'magic-wand';
      case 'guerrier':
        return 'sword';
      case 'archer':
        return 'bow';
      case 'voleur':
        return 'coin-bag';
      case 'prêtre':
      case 'pretre':
        return 'potion';
      default:
        return 'sword';
    }
  }

  formatPlayTime(minutes?: number): string {
    if (!minutes) return '0h';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}h ${mins}m`;
  }

  onCreateCharacter(): void {
    // Navigation vers la page de création de personnage
    this.router.navigate(['/create-character']);
  }

  onSelectCharacter(character: Character): void {
    // Logique pour sélectionner un personnage comme actif
    console.log('Personnage sélectionné:', character);

    // Mettre à jour le statut actif
    this.characters.forEach(
      (char) => (char.isActive = char.id === character.id)
    );

    // Redirection vers le tableau de bord
    // this.router.navigate(['/dashboard']);
  }
}
