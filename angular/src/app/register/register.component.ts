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
import { RouterModule } from '@angular/router';
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

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required]],
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
      this.authService
        .register({
          username: this.registerForm.value.username,
          password: this.registerForm.value.password,
          confirmPassword: this.registerForm.value.confirmPassword,
        })
        .subscribe({
          next: () => {
            // Navigation is handled in authService
            console.log('Registration successful');
          },
          error: (err) => {
            console.error('Registration failed:', err);
            this.registerError =
              "Erreur lors de l'inscription. Veuillez réessayer.";
          },
        });
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormGroupTouched(this.registerForm);
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
