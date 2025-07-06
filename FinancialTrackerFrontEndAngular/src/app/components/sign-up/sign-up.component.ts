import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.css'],
    standalone: false
})
export class SignUpComponent {
  signUpData = {
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  };
  signUpError: string = '';
  signUpSuccess: string = '';
  selectedTab: string = 'sign-up';

  constructor(private authService: AuthService, private router: Router) {}

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  onSignUp() {
    this.signUpError = '';
    this.signUpSuccess = '';
    if (this.signUpData.password !== this.signUpData.confirmPassword) {
      this.signUpError = 'Las contraseñas no coinciden.';
      return;
    }
    this.authService.register(this.signUpData.username, this.signUpData.email, this.signUpData.password)
      .subscribe({
        next: () => {
          this.signUpSuccess = '¡Registro exitoso! Ahora puedes iniciar sesión.';
          this.signUpData = { email: '', password: '', confirmPassword: '', username: '' };
        },
        error: (err) => {
          this.signUpError = err.error?.message || 'Error al registrar usuario.';
        }
      });
  }

  goToSignIn() {
    this.router.navigate(['/LogIn']);
  }
}
