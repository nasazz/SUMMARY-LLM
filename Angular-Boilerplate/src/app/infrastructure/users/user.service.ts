import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../core/config/api.config';
import { UserDto, PaginationQuery, UserHierarchyResponse } from '../../domain/dtos/user.dto';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private baseUrl = `${API_CONFIG.baseUrl}/users`;

    // Get All Users (Paged)
    getAllUsers(query: PaginationQuery = { pageNumber: 1, pageSize: 1000 }): Observable<any> {
        let params = new HttpParams()
            .set('pageNumber', query.pageNumber)
            .set('pageSize', query.pageSize);

        if (query.searchTerm) params = params.set('searchTerm', query.searchTerm);

        return this.http.get<any>(this.baseUrl, { params });
    }

    getUsers(query: PaginationQuery): Observable<any> {
        let params = new HttpParams()
            .set('pageNumber', query.pageNumber)
            .set('pageSize', query.pageSize);

        if (query.searchTerm) params = params.set('searchTerm', query.searchTerm);

        return this.http.get<any>(this.baseUrl, { params });
    }

    // Get Pending Users (for Approval Table)
    getPendingUsers(): Observable<UserDto[]> {
        return this.http.get<UserDto[]>(`${this.baseUrl}/pending`);
    }

    approveUser(userId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/${userId}/approve`, {});
    }

    rejectUser(userId: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/${userId}/reject`, {});
    }

    deleteUser(userId: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${userId}`);
    }

    updateUser(userId: string, data: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/${userId}`, data);
    }

    getSchedulableUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/schedulable`);
    }

    // Get users grouped by supervisor for hierarchical display
    getHierarchy(): Observable<UserHierarchyResponse> {
        return this.http.get<UserHierarchyResponse>(`${this.baseUrl}/hierarchy`);
    }
}

