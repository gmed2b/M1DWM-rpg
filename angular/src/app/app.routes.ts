import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'create-hero',
    loadComponent: () =>
      import('./create-hero/create-hero.component').then(
        (m) => m.CreateHeroComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'quests',
    loadComponent: () =>
      import('./quests/quests.component').then((m) => m.QuestsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'battles',
    loadComponent: () =>
      import('./battles/battles.component').then((m) => m.BattlesComponent),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
