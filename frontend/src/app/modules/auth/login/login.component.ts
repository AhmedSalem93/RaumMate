import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgModel } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  errorMessage: string = '';

  formData = {
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router, private userService: UserService) { }

  // login(form: NgForm): void {
  //   this.authService.login(form).subscribe({
  //     next: () => {
  //       this.router.navigate(['user/profile']);
  //     },
  //     error: (error) => {
  //       this.errorMessage = error.error.message || 'An error occurred during login';
  //       console.error(error);
  //     }
  //   });
  // }

  login(form: NgForm): void {
    this.authService.login(form).subscribe({
      next: () => {
        this.userService.getProfile().subscribe({
          next: user => {
            if (user.profileCompleted === false) {
              console.log('User profile is not complete');
              this.router.navigate(['user/complete-profile']);
              return;
            }
            this.router.navigate(['user/profile']);
          },
          error: error => {
            this.errorMessage = error.error.message || 'An error occurred during login';
            console.error(error);
          }
        });
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'An error occurred during login';
        console.error(error);
      }
    });
  }
  
  
}
