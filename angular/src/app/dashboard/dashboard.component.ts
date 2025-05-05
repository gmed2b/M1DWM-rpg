import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActiveHeroComponent } from '../active-hero/active-hero.component';
import { BattlePreviewComponent } from '../battle-preview/battle-preview.component';
import { QuestPreviewComponent } from '../quest-preview/quest-preview.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ActiveHeroComponent,
    QuestPreviewComponent,
    BattlePreviewComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {}
