import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CreateHeroDto, HeroService } from '../services/hero.service';

interface ClassOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

interface RaceOption {
  value: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-create-hero',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-hero.component.html',
  styleUrls: ['./create-hero.component.css'],
})
export class CreateHeroComponent implements OnInit {
  heroForm: FormGroup;
  createError: string | null = null;
  loading = false;

  // Points disponibles pour les statistiques
  availablePoints = 20;

  // Options de classe
  classOptions: ClassOption[] = [
    {
      value: 'warrior',
      label: 'Guerrier',
      description:
        'Spécialiste du combat au corps à corps avec une grande force.',
      icon: 'sword',
    },
    {
      value: 'mage',
      label: 'Mage',
      description: 'Manipule les arcanes pour lancer des sorts puissants.',
      icon: 'magic-wand',
    },
    {
      value: 'ranger',
      label: 'Archer',
      description: 'Expert du combat à distance avec une grande agilité.',
      icon: 'bow',
    },
    {
      value: 'rogue',
      label: 'Voleur',
      description: 'Maître de la discrétion et des attaques rapides.',
      icon: 'coin-bag',
    },
    {
      value: 'cleric',
      label: 'Prêtre',
      description: 'Soigneur et protecteur béni par les dieux.',
      icon: 'potion',
    },
  ];

  // Options de race
  raceOptions: RaceOption[] = [
    {
      value: 'human',
      label: 'Humain',
      description: 'Polyvalent et adaptable à toutes les situations.',
    },
    {
      value: 'elf',
      label: 'Elfe',
      description: "Gracieux et doué pour la magie et l'archerie.",
    },
    {
      value: 'dwarf',
      label: 'Nain',
      description: 'Robuste et résistant, expert en combat et artisanat.',
    },
    {
      value: 'orc',
      label: 'Orc',
      description: 'Fort et endurant, spécialiste du combat brutal.',
    },
  ];

  selectedClass: ClassOption | null = null;
  selectedRace: RaceOption | null = null;

  constructor(
    private fb: FormBuilder,
    private heroService: HeroService,
    private router: Router
  ) {
    this.heroForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
        ],
      ],
      race: ['', [Validators.required]],
      class_type: ['', [Validators.required]],
      stats: this.fb.group({
        strength: [
          5,
          [Validators.required, Validators.min(1), Validators.max(20)],
        ],
        magic: [
          5,
          [Validators.required, Validators.min(1), Validators.max(20)],
        ],
        agility: [
          5,
          [Validators.required, Validators.min(1), Validators.max(20)],
        ],
        speed: [
          5,
          [Validators.required, Validators.min(1), Validators.max(20)],
        ],
        charisma: [
          5,
          [Validators.required, Validators.min(1), Validators.max(20)],
        ],
        luck: [5, [Validators.required, Validators.min(1), Validators.max(20)]],
      }),
    });
  }

  ngOnInit(): void {
    // Réagir aux changements de classe et de race
    this.heroForm.get('class_type')?.valueChanges.subscribe((value) => {
      this.selectedClass =
        this.classOptions.find((c) => c.value === value) || null;
      this.adjustStatsForClass(value);
    });

    this.heroForm.get('race')?.valueChanges.subscribe((value) => {
      this.selectedRace =
        this.raceOptions.find((r) => r.value === value) || null;
      this.adjustStatsForRace(value);
    });

    // Surveiller les changements de statistiques pour calculer les points restants
    const statsControls = Object.keys(
      (this.heroForm.get('stats') as FormGroup).controls
    );
    statsControls.forEach((stat) => {
      this.heroForm
        .get('stats')
        ?.get(stat)
        ?.valueChanges.subscribe(() => {
          this.calculateRemainingPoints();
        });
    });
  }

  // Getters pour faciliter l'accès aux contrôles du formulaire
  get name() {
    return this.heroForm.get('name');
  }
  get race() {
    return this.heroForm.get('race');
  }
  get class_type() {
    return this.heroForm.get('class_type');
  }
  get stats() {
    return this.heroForm.get('stats') as FormGroup;
  }

  // Ajuste les statistiques en fonction de la classe choisie
  adjustStatsForClass(classValue: string): void {
    const statsGroup = this.heroForm.get('stats') as FormGroup;

    // Réinitialiser d'abord toutes les stats à 5
    Object.keys(statsGroup.controls).forEach((key) => {
      statsGroup.get(key)?.setValue(5, { emitEvent: false });
    });

    // Puis ajuster selon la classe
    switch (classValue) {
      case 'warrior':
        statsGroup.get('strength')?.setValue(8, { emitEvent: false });
        statsGroup.get('agility')?.setValue(6, { emitEvent: false });
        break;
      case 'mage':
        statsGroup.get('magic')?.setValue(8, { emitEvent: false });
        statsGroup.get('charisma')?.setValue(6, { emitEvent: false });
        break;
      case 'ranger':
        statsGroup.get('agility')?.setValue(8, { emitEvent: false });
        statsGroup.get('speed')?.setValue(6, { emitEvent: false });
        break;
      case 'rogue':
        statsGroup.get('speed')?.setValue(8, { emitEvent: false });
        statsGroup.get('luck')?.setValue(6, { emitEvent: false });
        break;
      case 'cleric':
        statsGroup.get('charisma')?.setValue(8, { emitEvent: false });
        statsGroup.get('magic')?.setValue(6, { emitEvent: false });
        break;
    }

    // Recalculer les points restants
    this.calculateRemainingPoints();
  }

  // Ajuste les statistiques en fonction de la race choisie
  adjustStatsForRace(raceValue: string): void {
    const statsGroup = this.heroForm.get('stats') as FormGroup;

    // Ajuster selon la race (bonus supplémentaire)
    switch (raceValue) {
      case 'human':
        statsGroup
          .get('charisma')
          ?.setValue(statsGroup.get('charisma')?.value + 1, {
            emitEvent: false,
          });
        break;
      case 'elf':
        statsGroup
          .get('magic')
          ?.setValue(statsGroup.get('magic')?.value + 1, { emitEvent: false });
        break;
      case 'dwarf':
        statsGroup
          .get('strength')
          ?.setValue(statsGroup.get('strength')?.value + 1, {
            emitEvent: false,
          });
        break;
      case 'orc':
        statsGroup
          .get('agility')
          ?.setValue(statsGroup.get('agility')?.value + 1, {
            emitEvent: false,
          });
        break;
    }

    // Recalculer les points restants
    this.calculateRemainingPoints();
  }

  // Calcule les points de statistiques restants
  calculateRemainingPoints(): void {
    const statsGroup = this.heroForm.get('stats') as FormGroup;
    let usedPoints = 0;

    Object.keys(statsGroup.controls).forEach((key) => {
      usedPoints += statsGroup.get(key)?.value || 0;
    });

    this.availablePoints = 50 - usedPoints;

    // Si dépassement, on désactive le formulaire
    if (this.availablePoints < 0) {
      this.heroForm.setErrors({ exceedMaxPoints: true });
    } else {
      this.heroForm.setErrors(null);
    }
  }

  // Incrémente une statistique
  incrementStat(statName: string): void {
    const control = this.stats.get(statName);
    if (control && this.availablePoints > 0 && control.value < 20) {
      control.setValue(control.value + 1);
    }
  }

  // Décrémente une statistique
  decrementStat(statName: string): void {
    const control = this.stats.get(statName);
    if (control && control.value > 1) {
      control.setValue(control.value - 1);
    }
  }

  onSubmit(): void {
    if (this.heroForm.invalid || this.availablePoints < 0) {
      // Marquer tous les contrôles comme touchés pour afficher les erreurs
      Object.keys(this.heroForm.controls).forEach((key) => {
        const control = this.heroForm.get(key);
        control?.markAsTouched();

        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach((subKey) => {
            control.get(subKey)?.markAsTouched();
          });
        }
      });
      return;
    }

    this.loading = true;
    this.createError = null;

    const heroData: CreateHeroDto = this.heroForm.value;

    this.heroService.createHero(heroData).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Héros créé avec succès!', response);
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur lors de la création du héros:', err);
        this.createError =
          'Erreur lors de la création du héros. Veuillez réessayer.';
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }
}
