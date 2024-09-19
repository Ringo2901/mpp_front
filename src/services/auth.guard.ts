import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";

export const authGuard: CanActivateFn = (route, state) => {
  const username = localStorage.getItem('username');

  if (!username) {
    const router = inject(Router);
    router.navigate(['/login']);
    return false;
  }

  return true;
};
