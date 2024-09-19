import {Routes} from '@angular/router';
import {TodoComponent} from "../todo/todo.component";
import {RegisterComponent} from "../register/register.component";
import {LoginComponent} from "../login/login.component";
import {authGuard} from "../services/auth.guard";

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'tasks', component: TodoComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
];
