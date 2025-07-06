import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

export interface ProfileData {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: false
})
export class ProfileComponent implements OnInit {
  profileData: ProfileData = {
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  isEditing = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.debugUserData();
  }

  loadUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.profileData.username = currentUser.username;
      this.profileData.email = currentUser.email;
    }
  }

  debugUserData(): void {
    const currentUser = this.authService.getCurrentUser();
    const localStorageUser = localStorage.getItem('currentUser');
    console.log('Current user from service:', currentUser);
    console.log('LocalStorage user:', localStorageUser);
    if (localStorageUser) {
      console.log('Parsed localStorage user:', JSON.parse(localStorageUser));
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserData();
      this.clearMessages();
    }
  }

  updateProfile(): void {
    this.isLoading = true;
    this.clearMessages();

    if (!this.profileData.username || !this.profileData.email) {
      this.errorMessage = 'Por favor, completa todos los campos obligatorios.';
      this.isLoading = false;
      return;
    }

    if (this.profileData.newPassword && this.profileData.newPassword !== this.profileData.confirmPassword) {
      this.errorMessage = 'Las contraseñas nuevas no coinciden.';
      this.isLoading = false;
      return;
    }

    setTimeout(() => {
      this.successMessage = 'Perfil actualizado exitosamente.';
      this.isLoading = false;
      this.isEditing = false;
      
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.authService.setCurrentUser({
          ...currentUser,
          username: this.profileData.username,
          email: this.profileData.email
        }, this.authService.getToken() || '');
      }
    }, 1000);
  }

  getMemberSince(): string {
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user:', currentUser);
    
    if (currentUser && currentUser.registerDate) {
      try {
        const registerDate = new Date(currentUser.registerDate);
        if (isNaN(registerDate.getTime())) {
          console.log('Invalid date:', currentUser.registerDate);
          return 'Fecha no disponible';
        }
        const formattedDate = registerDate.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long'
        });
        
        // Capitalizar la primera letra del mes
        return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
      } catch (error) {
        console.error('Error parsing date:', error);
        return 'Fecha no disponible';
      }
    }
    return 'Fecha no disponible';
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
