import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    const query = `
      query {
        tasks {
          id
          title
          status
          dueDate
          file
          fileName
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, { query }).pipe(
      map((response) => response.data.tasks),
      catchError((error) => {
        console.error('Error fetching tasks:', error);
        return throwError(() => new Error('Failed to fetch tasks. Please try again.'));
      })
    );
  }

  addTask(task: Partial<Task>): Observable<Task> {
    const mutation = `
      mutation($title: String!, $status: String!, $dueDate: String!, $file: String, $fileName: String) {
        createTask(title: $title, status: $status, dueDate: $dueDate, file: $file, fileName: $fileName) {
          id
          title
          status
          dueDate
          file
          fileName
        }
      }
    `;

    const variables = {
      title: task.title,
      status: task.status,
      dueDate: task.dueDate,
      file: task.file || null,
      fileName: task.fileName || null,
    };

    return this.http.post<any>(this.apiUrl, { query: mutation, variables }).pipe(
      map((response) => response.data.createTask),
      catchError((error) => {
        console.error('Error adding task:', error);
        return throwError(() => new Error('Failed to add task. Please try again.'));
      })
    );
  }

  updateTask(task: Task): Observable<Task> {
    const mutation = `
      mutation($id: ID!, $title: String!, $status: String!, $dueDate: String!) {
        updateTask(id: $id, title: $title, status: $status, dueDate: $dueDate) {
          id
          title
          status
          dueDate
        }
      }
    `;

    const variables = {
      id: task.id,
      title: task.title,
      status: task.status,
      dueDate: task.dueDate,
    };

    return this.http.post<any>(this.apiUrl, { query: mutation, variables }).pipe(
      map((response) => response.data.updateTask),
      catchError((error) => {
        console.error('Error updating task:', error);
        return throwError(() => new Error('Failed to update task. Please try again.'));
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    const mutation = `
      mutation($id: ID!) {
        deleteTask(id: $id)
      }
    `;

    const variables = {
      id,
    };

    return this.http.post<any>(this.apiUrl, { query: mutation, variables }).pipe(
      map(() => {}),
      catchError((error) => {
        console.error('Error deleting task:', error);
        return throwError(() => new Error('Failed to delete task. Please try again.'));
      })
    );
  }

  downloadFile(filename: string): void {
    const fileUrl = `http://localhost:3000/uploads/${filename}`;
    window.open(fileUrl);
  }
}
