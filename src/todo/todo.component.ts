import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {TaskService} from "../services/task.service";
import {Task} from "../models/task.model";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    FormsModule
  ],
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit {
  tasks: Task[] = [];
  taskForm: FormGroup;
  editTaskForm: FormGroup = new FormGroup({});
  editTaskId: number | null = null;
  errorMessage: string | null = null;
  selectedFileName: string | null = null;
  sortByDate: 'asc' | 'desc' = 'asc';
  sortByStatus: 'all' | 'pending' | 'completed' = 'all';

  constructor(private fb: FormBuilder, private taskService: TaskService) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      status: ['pending', Validators.required],
      dueDate: ['', Validators.required],
      file: [null]
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }
  applySortingAndFiltering(tasks: Task[]): void {
    if (this.sortByStatus !== 'all') {
      tasks = tasks.filter(task => task.status === this.sortByStatus);
    }

    tasks = tasks.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return this.sortByDate === 'asc' ? dateA - dateB : dateB - dateA;
    });

    this.tasks = tasks;
  }

  onSortChange(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    debugger
    this.taskService.getTasks().subscribe({
      next: (tasks) => this.applySortingAndFiltering(tasks),
      error: (error) => this.showErrorMessage(error.message)
    });
  }




  async onSubmit(): Promise<void> {
    if (this.taskForm.valid) {
      const formData: any = {
        title: this.taskForm.value.title,
        status: this.taskForm.value.status,
        dueDate: this.taskForm.value.dueDate,
        file: '',
        fileName: this.taskForm.get('file')?.value ? (this.taskForm.get('file')?.value as File).name : undefined
      };

      const file = this.taskForm.get('file')?.value as File;

      if (file) {
        try {
          const uint8Array = await this.convertFileToUint8Array(file);
          formData.file = uint8Array ? uint8Array.toString() : '';
        } catch (error) {
          this.showErrorMessage('Ошибка при чтении файла.');
          return;
        }
      }

      this.taskService.addTask(formData).subscribe({
        next: () => {
          this.loadTasks();
          this.taskForm.reset({ status: 'pending' });
          this.selectedFileName = null;
        },
        error: (error) => this.showErrorMessage(error.message)
      });
    }
  }


  convertFileToUint8Array(file: File | null): Promise<Uint8Array | null> {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target?.result instanceof ArrayBuffer) {
          resolve(new Uint8Array(event.target.result));
        } else {
          reject(new Error('Failed to read file as ArrayBuffer'));
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    });
  }

  onEditSubmit(): void {
    if (this.editTaskForm?.valid) {
      const updatedTask: Task = { ...this.editTaskForm.value, id: this.editTaskId };

      this.taskService.updateTask(updatedTask).subscribe({
        next: () => {
          this.loadTasks();
          this.cancelEdit();
        },
        error: (error) => this.showErrorMessage(error.message)
      });
    }
  }

  showErrorMessage(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = null;
    }, 5000);
  }

  editTask(task: Task): void {
    this.editTaskId = task.id ? task.id : 0;
    this.editTaskForm = this.fb.group({
      title: [task.title, Validators.required],
      status: [task.status, Validators.required],
      dueDate: [task.dueDate, Validators.required]
    });
  }

  cancelEdit(): void {
    this.editTaskId = null;
    this.editTaskForm.reset();
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => this.loadTasks(),
      error: (error) => this.showErrorMessage(error.message)
    });
  }
  stringToUint8Array(str: String): Uint8Array {
    const bytes = new Uint8Array(str.split('').map(char => char.charCodeAt(0)));
    return bytes;
  }
  downloadFile(task: Task): void {
    debugger;
    let blob = new Blob();
    if (task.file != null) {
      blob = new Blob([this.stringToUint8Array(task.file)], {type: 'application/octet-stream'});
    }
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = task.fileName ? task.fileName:"File";
    link.click();
    window.URL.revokeObjectURL(url);
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    this.selectedFileName = file ? file.name : null;
    if (file) {
      this.taskForm.patchValue({
        file: file
      });
    }
  }
}
