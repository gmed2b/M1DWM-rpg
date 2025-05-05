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
  icon: string;
}

// Interface pour définir les préréglages de stats
interface StatPreset {
  strength: number;
  magic: number;
  agility: number;
  speed: number;
  charisma: number;
  luck: number;
}

// Clé pour identifier une paire race/classe
type RaceClassKey = `${string}_${string}`;

@Component({
  selector: 'app-create-hero',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-hero.component.html',
  styleUrls: ['./create-hero.component.css'],
})
export class CreateHeroComponent implements OnInit {
  // Points maximum que l'utilisateur peut attribuer
  TOTAL_POINTS = 20;
  MAX_STAT_VALUE = 20; // Valeur maximum pour chaque statistique
  MIN_STAT_VALUE = 1; // Valeur minimum pour chaque statistique

  heroForm: FormGroup;
  createError: string | null = null;
  loading = false;

  // Points disponibles pour les statistiques
  availablePoints = this.TOTAL_POINTS;

  // Options de classe
  classOptions: ClassOption[] = [
    {
      value: 'warrior',
      label: 'Guerrier',
      description:
        'Spécialiste du combat au corps à corps avec une grande force.',
      icon: 'sword-2',
    },
    {
      value: 'mage',
      label: 'Mage',
      description: 'Manipule les arcanes pour lancer des sorts puissants.',
      icon: 'wand',
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
      icon: 'wand',
    },
    {
      value: 'elf',
      label: 'Elfe',
      description: "Gracieux et doué pour la magie et l'archerie.",
      icon: 'wand',
    },
    {
      value: 'demon',
      label: 'Démon',
      description: 'Robuste et résistant, expert en combat et artisanat.',
      icon: 'wand',
    },
    {
      value: 'orc',
      label: 'Orc',
      description: 'Fort et endurant, spécialiste du combat brutal.',
      icon: 'wand',
    },
  ];

  // Map des préréglages de stats pour chaque combinaison race/classe
  statPresets: Record<RaceClassKey, StatPreset> = {
    // Humain
    human_warrior: {
      strength: 8,
      magic: 1,
      agility: 4,
      speed: 3,
      charisma: 3,
      luck: 1,
    },
    human_mage: {
      strength: 2,
      magic: 8,
      agility: 2,
      speed: 2,
      charisma: 5,
      luck: 1,
    },
    human_ranger: {
      strength: 3,
      magic: 2,
      agility: 8,
      speed: 4,
      charisma: 2,
      luck: 1,
    },
    human_rogue: {
      strength: 3,
      magic: 1,
      agility: 6,
      speed: 6,
      charisma: 2,
      luck: 2,
    },
    human_cleric: {
      strength: 3,
      magic: 6,
      agility: 1,
      speed: 2,
      charisma: 7,
      luck: 1,
    },

    // Elfe
    elf_warrior: {
      strength: 6,
      magic: 3,
      agility: 5,
      speed: 3,
      charisma: 2,
      luck: 1,
    },
    elf_mage: {
      strength: 1,
      magic: 10,
      agility: 2,
      speed: 3,
      charisma: 3,
      luck: 1,
    },
    elf_ranger: {
      strength: 2,
      magic: 3,
      agility: 9,
      speed: 4,
      charisma: 1,
      luck: 1,
    },
    elf_rogue: {
      strength: 2,
      magic: 2,
      agility: 6,
      speed: 7,
      charisma: 1,
      luck: 2,
    },
    elf_cleric: {
      strength: 2,
      magic: 8,
      agility: 2,
      speed: 2,
      charisma: 5,
      luck: 1,
    },

    // Démon
    demon_warrior: {
      strength: 9,
      magic: 2,
      agility: 3,
      speed: 2,
      charisma: 1,
      luck: 3,
    },
    demon_mage: {
      strength: 3,
      magic: 9,
      agility: 1,
      speed: 2,
      charisma: 2,
      luck: 3,
    },
    demon_ranger: {
      strength: 4,
      magic: 2,
      agility: 7,
      speed: 3,
      charisma: 1,
      luck: 3,
    },
    demon_rogue: {
      strength: 3,
      magic: 1,
      agility: 5,
      speed: 7,
      charisma: 1,
      luck: 3,
    },
    demon_cleric: {
      strength: 3,
      magic: 6,
      agility: 2,
      speed: 2,
      charisma: 4,
      luck: 3,
    },

    // Orc
    orc_warrior: {
      strength: 10,
      magic: 1,
      agility: 2,
      speed: 3,
      charisma: 1,
      luck: 3,
    },
    orc_mage: {
      strength: 5,
      magic: 7,
      agility: 1,
      speed: 2,
      charisma: 2,
      luck: 3,
    },
    orc_ranger: {
      strength: 6,
      magic: 1,
      agility: 6,
      speed: 4,
      charisma: 1,
      luck: 2,
    },
    orc_rogue: {
      strength: 6,
      magic: 1,
      agility: 4,
      speed: 6,
      charisma: 1,
      luck: 2,
    },
    orc_cleric: {
      strength: 5,
      magic: 5,
      agility: 2,
      speed: 2,
      charisma: 4,
      luck: 2,
    },
  };

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
      race: ['human', [Validators.required]],
      class_type: ['warrior', [Validators.required]],
      stats: this.fb.group({
        strength: [
          1,
          [
            Validators.required,
            Validators.min(this.MIN_STAT_VALUE),
            Validators.max(this.MAX_STAT_VALUE),
          ],
        ],
        magic: [
          1,
          [
            Validators.required,
            Validators.min(this.MIN_STAT_VALUE),
            Validators.max(this.MAX_STAT_VALUE),
          ],
        ],
        agility: [
          1,
          [
            Validators.required,
            Validators.min(this.MIN_STAT_VALUE),
            Validators.max(this.MAX_STAT_VALUE),
          ],
        ],
        speed: [
          1,
          [
            Validators.required,
            Validators.min(this.MIN_STAT_VALUE),
            Validators.max(this.MAX_STAT_VALUE),
          ],
        ],
        charisma: [
          1,
          [
            Validators.required,
            Validators.min(this.MIN_STAT_VALUE),
            Validators.max(this.MAX_STAT_VALUE),
          ],
        ],
        luck: [
          1,
          [
            Validators.required,
            Validators.min(this.MIN_STAT_VALUE),
            Validators.max(this.MAX_STAT_VALUE),
          ],
        ],
      }),
    });

    // Appliquer le préréglage de stats par défaut
    this.applyStatPreset();
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

  // Ajuste les statistiques en fonction de la race et classe choisies
  applyStatPreset(): void {
    const race = this.race?.value;
    const classType = this.class_type?.value;

    if (race && classType) {
      const presetKey = `${race}_${classType}` as RaceClassKey;
      const preset = this.statPresets[presetKey];

      if (preset) {
        const statsGroup = this.heroForm.get('stats') as FormGroup;

        // Appliquer les valeurs du preset aux champs du formulaire
        Object.keys(preset).forEach((stat) => {
          statsGroup
            .get(stat)
            ?.setValue(preset[stat as keyof StatPreset], { emitEvent: false });
        });

        // Recalculer les points restants
        this.calculateRemainingPoints();
      }
    }
  }

  // Remplacer les anciennes méthodes d'ajustement des stats
  adjustStatsForClass(classValue: string): void {
    this.applyStatPreset();
  }

  adjustStatsForRace(raceValue: string): void {
    this.applyStatPreset();
  }

  // Calcule les points de statistiques restants
  calculateRemainingPoints(): void {
    const statsGroup = this.heroForm.get('stats') as FormGroup;
    let usedPoints = 0;

    // Calculer le total des points utilisés
    Object.keys(statsGroup.controls).forEach((key) => {
      usedPoints += statsGroup.get(key)?.value || 0;
    });

    // Le total des points disponibles est fixé à 20
    const basePoints = 6; // 6 points de base (1 point par stat)
    this.availablePoints = this.TOTAL_POINTS - (usedPoints - basePoints);

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
    if (
      control &&
      this.availablePoints > 0 &&
      control.value < this.MAX_STAT_VALUE
    ) {
      control.setValue(control.value + 1);
    }
  }

  // Décrémente une statistique
  decrementStat(statName: string): void {
    const control = this.stats.get(statName);
    if (control && control.value > this.MIN_STAT_VALUE) {
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
