import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  constructor(private socket: Socket) {}

  emit(eventName: string, data?: unknown): void {
    this.socket.emit(eventName, data);
  }

  listen<T>(eventName: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      this.socket.on(eventName, (data: T) => {
        subscriber.next(data);
      });

      this.socket.on('error', (error: any) => {
        subscriber.error(error);
      });

      return () => {
        this.socket.off(eventName);
        this.socket.off('error');
      };
    }).pipe(
      catchError(error => throwError(() => new Error(error)))
    );
  }
}
