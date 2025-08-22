import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = `${environment.apiUrl}/api/email`;

  constructor(private http: HttpClient) { }

  testWeeklyReport(userId: number) {
    return this.http.post(`${this.apiUrl}/test-weekly-report/${userId}`, {}).pipe(
      take(1) // Asegura que se complete automáticamente
    );
  }

  testMonthlyReport(userId: number) {
    return this.http.post(`${this.apiUrl}/test-monthly-report/${userId}`, {}).pipe(
      take(1) // Asegura que se complete automáticamente
    );
  }
}