import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MyWalletsComponent } from './components/my-wallets/my-wallets.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { LogINComponent } from './components/log-in/log-in.component';
import { AuthGuard } from './services/auth/auth.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

const routes: Routes = [
  {path: 'LogIn', component: LogINComponent},
  {path: 'SignUp', component: SignUpComponent},
  {path: 'ForgotPassword', component: ForgotPasswordComponent},
  {path: 'ResetPassword', component: ResetPasswordComponent},
  {path: 'Home', component: HomeComponent, canActivate: [AuthGuard] },
  {path: 'MyWallets', component: MyWalletsComponent, canActivate: [AuthGuard] },
  {path: 'Payments', component: PaymentsComponent, canActivate: [AuthGuard] },
  {path: 'Profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path:  '**', redirectTo: '/Home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
