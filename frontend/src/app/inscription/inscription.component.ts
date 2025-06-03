import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';  // ✅ à importer
import { HttpClientModule } from '@angular/common/http'; // ⚠️ à ajouter dans le module parent si ce n’est pas déjà fait

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLink],
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.scss']
})
export class SignupComponent {
  formData = {
    username: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService) {}  // ✅ Injection du service

  onSubmit() {
    this.authService.register(this.formData).subscribe({
      next: (res) => {
        console.log('Inscription réussie !', res);
        alert('Inscription réussie !');
      },
      error: (err) => {
        console.error('Erreur lors de l’inscription :', err);
        alert('Une erreur est survenue lors de l’inscription.');
      }
    });
  }
}
