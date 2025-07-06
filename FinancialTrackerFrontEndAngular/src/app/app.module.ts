import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { MyWalletsComponent } from './components/my-wallets/my-wallets.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { LogINComponent } from './components/log-in/log-in.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthInterceptor } from './services/auth/auth.interceptor';
import { ProfileComponent } from './components/profile/profile.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MyWalletsComponent,
    PaymentsComponent,
    SignUpComponent,
    LogINComponent,
    NavbarComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CommonModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
