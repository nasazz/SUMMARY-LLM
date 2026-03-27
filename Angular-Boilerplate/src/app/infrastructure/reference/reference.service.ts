import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../core/config/api.config';

export interface Plant {
    id: string;
    name: string;
    code: string;
    buildingId: string;
    // properties might be needed for display
}

export interface Department {
    id: string;
    name: string;
}

@Injectable({
    providedIn: 'root'
})
export class ReferenceService {
    private http = inject(HttpClient);

    getPlants(): Observable<Plant[]> {
        return this.http.get<Plant[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.reference.plants}`);
    }

    getDepartments(): Observable<Department[]> {
        return this.http.get<Department[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.reference.departments}`);
    }
}
