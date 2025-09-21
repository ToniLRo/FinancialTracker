import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MyWalletsComponent } from './components/my-wallets/my-wallets.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { LogINComponent } from './components/log-in/log-in.component';
import { AuthGuard } from './guards/auth.guard';
import { MaintenanceGuard } from './guards/maintenance.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { SettingsComponent } from './components/settings/settings.component';
import { MaintenanceInfoComponent } from './components/maintenance-info/maintenance-info.component';

const routes: Routes = [
  // Redirección de la ruta raíz
  { path: '', redirectTo: '/Home', pathMatch: 'full' },
  
  // Rutas públicas que no requieren autenticación pero sí verificación de mantenimiento
  { path: 'LogIn', component: LogINComponent, canActivate: [MaintenanceGuard] },
  { path: 'SignUp', component: SignUpComponent, canActivate: [MaintenanceGuard] },
  { path: 'ForgotPassword', component: ForgotPasswordComponent, canActivate: [MaintenanceGuard] },
  { path: 'ResetPassword', component: ResetPasswordComponent, canActivate: [MaintenanceGuard] },
  
  // Ruta de mantenimiento (siempre accesible)
  { path: 'info', component: MaintenanceInfoComponent },
  
  // Rutas protegidas que requieren autenticación Y verificación de mantenimiento
  { path: 'Home', component: HomeComponent, canActivate: [MaintenanceGuard, AuthGuard] },
  { path: 'MyWallets', component: MyWalletsComponent, canActivate: [MaintenanceGuard, AuthGuard] },
  { path: 'Payments', component: PaymentsComponent, canActivate: [MaintenanceGuard, AuthGuard] },
  { path: 'Profile', component: ProfileComponent, canActivate: [MaintenanceGuard, AuthGuard] },
  { path: 'Settings', component: SettingsComponent, canActivate: [MaintenanceGuard, AuthGuard] },
  
  // Ruta por defecto para rutas no encontradas
  { path: '**', redirectTo: '/Home', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    MaintenanceInfoComponent
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
