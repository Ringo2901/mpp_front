import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'front';
  username: string | null = null;
  private storageListener: (event: StorageEvent) => void;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.storageListener = (event: StorageEvent): void => {
      if (event.key === 'username') {
        this.updateUsername();
      }
    };
  }

  ngOnInit(): void {
    this.updateUsername();
    window.addEventListener('storage', this.storageListener);

    //this.socketService.listen<string>('username-update').subscribe(username => {
    //  this.username = username;
    //});
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.storageListener);
  }

  private updateUsername(): void {
    this.username = this.authService.getUsername();
  }

  logout(): void {
   this.authService.logout();

    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }
}
