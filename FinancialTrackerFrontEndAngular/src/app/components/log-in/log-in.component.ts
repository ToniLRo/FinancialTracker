import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users/users.service';

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

  constructor(
    private usersService: UsersService,
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
    
    if (!this.loginData.username || !this.loginData.password) {
      this.loginError = 'Por favor, completa todos los campos.';
      return;
    }

    this.usersService.login(this.loginData.username, this.loginData.password)
      .subscribe({
        next: (response) => {
          this.loginSuccess = '¡Login exitoso!';
          
          this.usersService.setCurrentUser({
            userId: response.userId,
            username: response.username,
            email: response.email
          });
          
          setTimeout(() => {
            this.router.navigate(['/Home']);
          }, 1000);
        },
        error: (err) => {
          this.loginError = err.error?.message || 'Error en el login. Verifica tus credenciales.';
        }
      });
  }
}
