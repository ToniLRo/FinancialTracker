import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiUpdateControlService {
    private readonly apiUrl = environment.apiUrl+"/api/update-control";

    constructor(private http: HttpClient) {}

    checkUpdateStatus(type: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/check/${type}`).pipe(
            shareReplay(1), // Cachea el estado de actualización
            take(1) // Asegura que se complete automáticamente
        );
    }

    recordUpdate(type: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/update/${type}`, {}).pipe(
            take(1) // Asegura que se complete automáticamente
        );
    }

    getAllStatus(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/status`).pipe(
            shareReplay(1), // Cachea todos los estados
            take(1) // Asegura que se complete automáticamente
        );
    }
} 