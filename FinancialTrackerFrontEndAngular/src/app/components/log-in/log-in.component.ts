import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogINComponent implements OnInit {
  loginData = {
    username: '',
    password: ''
  };

  constructor(private router: Router) { }

  ngOnInit(): void {  
  }

  goToSignUp() {
    this.router.navigate(['/SignUp']);
  }

  onLogin() { 
    console.log('Login data:', this.loginData);
    // Aquí irá la lógica de login
  }
}
