import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  character = {
    strength: 10,
    agility: 10,
    intelligence: 10,
    endurance: 10,
    attack: 10,
    defense: 10,
    life: 100,
    mana: 100,
  };
}
