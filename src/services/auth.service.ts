import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    const mutation = `
      mutation($username: String!, $password: String!) {
        login(username: $username, password: $password)
      }
    `;

    const variables = { username, password };

    return this.http.post<any>(this.apiUrl, { query: mutation, variables }).pipe(
      tap((response) => {
        const token = response.data.login;
        if (token) {
          localStorage.setItem('username', username);
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed. Please try again.'));
      })
    );
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  register(username: string, password: string): Observable<any> {
    const mutation = `
      mutation($username: String!, $password: String!) {
        register(username: $username, password: $password)
      }
    `;

    const variables = { username, password };

    return this.http.post<any>(this.apiUrl, { query: mutation, variables }).pipe(
      map((response) => response.data.register),
      catchError((error) => {
        console.error('Registration error:', error);
        return throwError(() => new Error('Registration failed. Please try again.'));
      })
    );
  }

  logout(): void {
    const mutation = `
      mutation {
        logout
      }
    `;

    this.http.post<any>(this.apiUrl, { query: mutation }).subscribe(
      () => {
        localStorage.removeItem('username');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Logout error:', error);
      }
    );
  }
}
