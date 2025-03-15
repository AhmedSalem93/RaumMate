import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [ RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private authService: AuthService, private router: Router) { }

  logout(): void {
    console.log('logging out');
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    window.location.reload();
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

}
