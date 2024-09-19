import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SocketService } from './socket.service';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private socketService: SocketService) {}

  getTasks(): Observable<Task[]> {
    this.socketService.emit('getTasks');

    return this.socketService.listen<Task[]>('tasks').pipe(
      catchError(error => {
        console.error('Error fetching tasks:', error);
        return throwError(() => new Error('Failed to fetch tasks. Please try again.'));
      })
    );
  }

  addTask(task: any): Observable<Task> {
    debugger
    this.socketService.emit('createTask', task);

    return this.socketService.listen<Task>('taskCreated').pipe(
      catchError(error => {
        console.error('Error adding task:', error);
        return throwError(() => new Error('Failed to add task. Please try again.'));
      })
    );
  }

  updateTask(task: Task): Observable<Task> {
    this.socketService.emit('updateTask', { id: task.id, taskData: task });

    return this.socketService.listen<Task>('taskUpdated').pipe(
      catchError(error => {
        console.error('Error updating task:', error);
        return throwError(() => new Error('Failed to update task. Please try again.'));
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    this.socketService.emit('deleteTask', id);

    return this.socketService.listen<void>('taskDeleted').pipe(
      catchError(error => {
        console.error('Error deleting task:', error);
        return throwError(() => new Error('Failed to delete task. Please try again.'));
      })
    );
  }

  downloadFile(filename: string): void {
    const fileUrl = `http://localhost:3000/tasks/file/${filename}`;
    window.open(fileUrl);
  }
}
