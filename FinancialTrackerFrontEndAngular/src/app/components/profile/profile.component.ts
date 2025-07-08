import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service'; 
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ProfileData {
  username: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
} 

export interface ChangePasswordRequest {
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

    // Validaciones básicas
    if (!this.profileData.username || !this.profileData.email) {
      this.errorMessage = 'Por favor, completa todos los campos obligatorios.';
      this.isLoading = false;
      return;
    }

    // Validar contraseña si se está cambiando
    if (this.profileData.newPassword || this.profileData.currentPassword) {
      if (!this.profileData.currentPassword) {
        this.errorMessage = 'Debes ingresar tu contraseña actual para cambiarla.';
        this.isLoading = false;
        return;
      }
      
      if (!this.profileData.newPassword) {
        this.errorMessage = 'Debes ingresar una nueva contraseña.';
        this.isLoading = false;
        return;
      }
      
      if (this.profileData.newPassword !== this.profileData.confirmPassword) {
        this.errorMessage = 'Las contraseñas nuevas no coinciden.';
        this.isLoading = false;
        return;
      }
      
      if (this.profileData.newPassword.length < 6) {
        this.errorMessage = 'La nueva contraseña debe tener al menos 6 caracteres.';
        this.isLoading = false;
        return;
      }
    }

    // Si hay cambio de contraseña, hacer la llamada al servidor
    if (this.profileData.newPassword) {
      this.authService.changePassword({
        currentPassword: this.profileData.currentPassword,
        newPassword: this.profileData.newPassword,
        confirmPassword: this.profileData.confirmPassword
      }).subscribe({
        next: (response) => {
          this.successMessage = 'Perfil y contraseña actualizados exitosamente.';
          this.isLoading = false;
          this.isEditing = false;
          
          // Limpiar campos de contraseña
          this.profileData.currentPassword = '';
          this.profileData.newPassword = '';
          this.profileData.confirmPassword = '';
          
          // Actualizar usuario en localStorage
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            this.authService.setCurrentUser({
              ...currentUser,
              username: this.profileData.username
            }, this.authService.getToken() || '');
          }
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error al actualizar la contraseña.';
          this.isLoading = false;
        }
      });
    } else {
      // Solo actualizar datos del perfil (sin contraseña)
      setTimeout(() => {
        this.successMessage = 'Perfil actualizado exitosamente.';
        this.isLoading = false;
        this.isEditing = false;
        
        // Actualizar usuario en localStorage
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.authService.setCurrentUser({
            ...currentUser,
            username: this.profileData.username
          }, this.authService.getToken() || '');
        }
      }, 1000);
    }
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
