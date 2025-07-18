import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
    selector: 'app-log-in',
    templateUrl: './log-in.component.html',
    styleUrls: ['./log-in.component.css'],
    standalone: false
})
export class LogINComponent implements OnInit {
  loginData = {
    username: '',
    password: ''
  };
  loginError: string = '';
  loginSuccess: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  goToSignUp() {
    this.router.navigate(['/SignUp']);
  }
  
  onLogin() {
    this.loginError = '';
    this.loginSuccess = '';
    this.isLoading = true;
    
    if (!this.loginData.username || !this.loginData.password) {
      this.loginError = 'Por favor, completa todos los campos.';
      this.isLoading = false;
      return;
    }

    this.authService.login(this.loginData.username, this.loginData.password)
      .subscribe({
        next: (response) => {
          this.loginSuccess = '¡Login exitoso!';
          this.isLoading = false;
          
          console.log('Login response:', response); // Debug: ver qué está llegando
          
          this.authService.setCurrentUser({
            userId: response.userId,
            username: response.username,
            email: response.email,
            registerDate: response.registerDate // Asegurar que se guarde
          }, response.token);
          
            this.router.navigate(['/Home']);
        },
        error: (err) => {
          this.loginError = err.error?.message || 'Error en el login. Verifica tus credenciales.';
          this.isLoading = false;
        }
      });
  }
}
