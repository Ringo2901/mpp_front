import {Component} from '@angular/core';
import {AuthService} from "../services/auth.service";
import {Router, RouterLink} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {
  }

  login() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Username and password are required';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.authService.login(this.username, this.password).subscribe(
      () => this.router.navigate(['/tasks']),
      (error) => (this.errorMessage = 'Invalid credentials')
    );
  }
}
