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

  onSubmit(): void {
    if (this.taskForm.valid) {
      debugger
      const formData = {
        title: this.taskForm.value.title,
        status: this.taskForm.value.status,
        dueDate: this.taskForm.value.dueDate,
        file: this.taskForm.get('file')?.value ? (this.taskForm.get('file')?.value as File) : null,
        fileName: this.taskForm.get('file')?.value ? (this.taskForm.get('file')?.value as File).name : null
      };
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

  downloadFile(task: Task): void {
    debugger;
    let blob = new Blob();
    if (task.file != null) {
      blob = new Blob([task.file], {type: 'application/octet-stream'});
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
