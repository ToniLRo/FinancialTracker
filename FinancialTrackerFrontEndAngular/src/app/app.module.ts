import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { LogINComponent } from './components/log-in/log-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MyWalletsComponent } from './components/my-wallets/my-wallets.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { BaseChartDirective } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LogINComponent,
    SignUpComponent,
    NavbarComponent,
    MyWalletsComponent,
    PaymentsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BaseChartDirective,
    FormsModule,
    HttpClientModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
