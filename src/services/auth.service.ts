import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private socketService: SocketService, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    this.socketService.emit('login', { username, password });

    return this.socketService.listen<any>('loginSuccess').pipe(
      tap(response => {
        if (response.username) {
          localStorage.setItem('username', response.username);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Login failed. Please try again.'));
      })
    );
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  register(username: string, password: string): Observable<any> {
    this.socketService.emit('register', { username, password });

    return this.socketService.listen<any>('registerSuccess').pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => new Error('Registration failed. Please try again.'));
      })
    );
  }

  logout(): void {
    this.socketService.emit('logout');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }
}
