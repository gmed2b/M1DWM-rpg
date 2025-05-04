import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  registerError: string | null = null;
  registerSuccess: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(2)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit(): void {}

  // Getters pour accéder facilement aux contrôles du formulaire
  get username() {
    return this.registerForm.get('username')!;
  }
  get password() {
    return this.registerForm.get('password')!;
  }
  get confirmPassword() {
    return this.registerForm.get('confirmPassword')!;
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword && confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.registerError = null;
      this.registerSuccess = null;
      this.isLoading = true;

      this.authService
        .register({
          username: this.registerForm.value.username,
          password: this.registerForm.value.password,
          confirmPassword: this.registerForm.value.confirmPassword,
        })
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.registerSuccess =
              'Inscription réussie ! Vous allez être redirigé...';
            console.log('Registration successful');

            // Réinitialiser le formulaire
            this.registerForm.reset();

            // Redirection automatique après 2 secondes
            setTimeout(() => {
              this.registerSuccess = null;
              this.router.navigate(['/login']);
            }, 2000);
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Registration failed:', err);

            // Messages d'erreur plus spécifiques selon le type d'erreur
            if (err.status === 401) {
              this.registerError =
                "Ce nom d'aventurier est déjà pris. Veuillez en choisir un autre.";
            } else {
              this.registerError =
                "Erreur lors de l'inscription. Veuillez réessayer.";
            }
          },
        });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormGroupTouched(this.registerForm);
      this.registerError =
        'Veuillez corriger les erreurs dans le formulaire avant de continuer.';
    }
  }

  // Fonction utilitaire pour marquer tous les champs comme touchés
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
