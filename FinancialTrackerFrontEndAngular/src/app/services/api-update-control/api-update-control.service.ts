import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiUpdateControlService {
    private readonly apiUrl = 'http://localhost:8080/api/update-control';

    constructor(private http: HttpClient) {}

    checkUpdateStatus(type: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/check/${type}`);
    }

    recordUpdate(type: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/update/${type}`, {});
    }

    getAllStatus(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/status`);
    }
} 