import { Component, NgModule, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MotService } from '../services/mot/mot.service';
import { HttpClient } from '@angular/common/http'; // ✅ Ajouté
import { NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule } from '@angular/forms';


type LettreStatus = 'correct-position' | 'present' | 'absent' | 'empty';

@Component({
  selector: 'app-game-grid',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, FormsModule],
  templateUrl: './game-grid.component.html',
  styleUrls: ['./game-grid.component.scss']
})
export class GameGridComponent implements OnInit {
  motSecret = '';
  essais: string[][] = [];
  statuts: LettreStatus[][] = [];
  jeuTermine = false;
  motTrouve = false;
  etatFinal: 'gagné' | 'perdu' | null = null;
  score: number = 0;
  menuVisible: boolean = false;
  
  difficulte: string = 'facile';

  // ✅ Classement des joueurs
  classement: any[] = [];

  constructor(
    private motService: MotService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.motService.getMot().subscribe({
      next: (data) => {
        this.motSecret = data.mot.toUpperCase();
        this.initGrilles(this.motSecret.length);
        console.log("Mot secret reçu du backend:", this.motSecret);
      },
      error: (err) => {
        console.error("Erreur lors de la récupération du mot :", err);
      }
    });

    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.score = user.score || 0;
    }

    // ✅ Charger le classement des joueurs
    this.chargerClassement();
  }

  // ✅ Nouvelle méthode pour charger le classement
  chargerClassement() {
    this.http.get<any[]>('http://localhost:3000/auth/users/classement')
      .subscribe({
        next: (res) => {
          this.classement = res;
          console.log("✅ Classement chargé :", res);
        },
        error: (err) => {
          console.error("❌ Erreur lors du chargement du classement :", err);
        }
      });
  }

  initGrilles(tailleMot: number) {
    this.essais = Array(6).fill(null).map(() => Array(tailleMot).fill(''));
    this.statuts = Array(6).fill(null).map(() => Array(tailleMot).fill('empty'));

    for (let i = 0; i < 6; i++) {
      this.essais[i][0] = this.motSecret[0];
      this.statuts[i][0] = 'correct-position';
    }
  }

  evaluerStatuts(indexEssai: number) {
    const mot = this.motSecret.toUpperCase();
    const essai = this.essais[indexEssai].map(l => l.toUpperCase());

    const statutLettres: LettreStatus[] = Array(essai.length).fill('absent');
    const lettresRestantes: (string | null)[] = mot.split('');

    for (let i = 0; i < essai.length; i++) {
      if (!essai[i] || essai[i].trim() === '') {
        statutLettres[i] = 'empty';
      }
    }

    for (let i = 0; i < essai.length; i++) {
      if (statutLettres[i] !== 'empty' && essai[i] === mot[i]) {
        statutLettres[i] = 'correct-position';
        lettresRestantes[i] = null;
      }
    }

    for (let i = 0; i < essai.length; i++) {
      if (statutLettres[i] === 'absent' && essai[i]) {
        const indexLettre = lettresRestantes.indexOf(essai[i]);
        if (indexLettre !== -1) {
          statutLettres[i] = 'present';
          lettresRestantes[indexLettre] = null;
        }
      }
    }

    this.statuts[indexEssai] = statutLettres;

    const motEstTrouve = statutLettres.every(statut => statut === 'correct-position');
    if (motEstTrouve || indexEssai === 5) {
      this.jeuTermine = true;
      this.motTrouve = motEstTrouve;
      this.etatFinal = motEstTrouve ? 'gagné' : 'perdu';

      if (motEstTrouve) {
        this.score += 10;
        this.mettreAJourScore(this.score);
      } else {
        this.score -= 2;
        this.mettreAJourScore(this.score);
      }
    }
  }

  handleInput(event: Event, ligneIndex: number, colonneIndex: number) {
    if (this.jeuTermine) return;

    const input = event.target as HTMLInputElement;
    const char = input.value.toUpperCase().charAt(0);

    if (char.match(/^[A-ZÀÂÇÉÈÊËÎÏÔŒÙÛÜŸ]$/)) {
      this.essais[ligneIndex][colonneIndex] = char;
      input.value = char;
    } else {
      this.essais[ligneIndex][colonneIndex] = '';
      input.value = '';
    }

    this.evaluerStatuts(ligneIndex);
  }

  rejouer() {
    this.jeuTermine = false;
    this.motTrouve = false;
    this.etatFinal = null;
    this.ngOnInit();
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible;
  }

  deconnexion() {
    localStorage.removeItem('user');
    this.menuVisible = false;
    this.router.navigate(['/connexion']);
  }

  mettreAJourScore(nouveauScore: number) {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const userId = user.id;
    const body = { score: nouveauScore };

    this.http.put(`http://localhost:3000/auth/users/${userId}/score`, body)
      .subscribe({
        next: (res) => {
          user.score = nouveauScore;
          localStorage.setItem('user', JSON.stringify(user));
          this.chargerClassement(); // ✅ Mise à jour du classement après changement de score
        },
        error: (err) => {
          console.error("❌ Erreur lors de la mise à jour du score :", err);
        }
      });
  }

  initEssais() {
    this.essais = [];
  }

  demarrerJeu() {
  this.http.get<{ mot: string }>(`http://localhost:3000/jeu/${this.difficulte}`)
    .subscribe({
      next: (response) => {
        this.motSecret = response.mot.toUpperCase();
        console.log('Mot récupéré:', this.motSecret);

        // Reinitialiser la grille selon la nouvelle longueur du mot
        this.initGrilles(this.motSecret.length);

        this.jeuTermine = false;
        this.motTrouve = false;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du mot:', err);
      }
    });
}

}
