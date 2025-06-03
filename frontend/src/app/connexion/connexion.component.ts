import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-connexion',
  imports: [FormsModule, RouterLink, NgIf],
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.scss']
})
export class ConnexionComponent {
  formData = {
    email: '',
    password: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.http.post<any>('http://localhost:3000/auth/login', this.formData).subscribe({
      next: (res) => {
        alert(res.message); // "Connexion réussie !"

        // Stocker l'utilisateur et son score dans localStorage (ou un service)
        localStorage.setItem('user', JSON.stringify(res.user));

        // Rediriger vers game-grid
        this.router.navigate(['/game-grid']);
      },
      error: (err) => {
        // Gérer le cas où err.error pourrait être undefined
        const errorMessage = err.error?.message || 'Erreur lors de la connexion';
        alert(errorMessage);
      }
    });
  }
}
