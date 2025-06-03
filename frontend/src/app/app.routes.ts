import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'game-grid',
    loadComponent: () =>
      import('./game-grid/game-grid.component').then(m => m.GameGridComponent), canActivate: [AuthGuard]
  },
  {
    path: 'inscription',
    loadComponent: () =>
      import('./inscription/inscription.component').then(m => m.SignupComponent)
  },
  {
    path: 'connexion',
    loadComponent: () =>
      import('./connexion/connexion.component').then(m => m.ConnexionComponent)
  },
  {
    path: '',
    redirectTo: 'inscription', // ou 'game-grid' selon ta page d'accueil souhaitée
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'inscription' // ou page 404 personnalisée si tu en as une
  }
];
