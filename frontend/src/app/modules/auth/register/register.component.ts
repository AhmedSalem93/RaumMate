import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(registrationForm: NgForm) {
    if (
      registrationForm.invalid ||
      this.formData.password !== this.formData.confirmPassword
    ) {
      return;
    }

    // Send registration data to the backend
    this.http
      .post('http://localhost:3000/api/auth/register', this.formData)
      .subscribe({
        next: (response) => {
          alert('Registration successful!');
          console.log(response);
          this.router.navigate(['/login']); // Redirect to login page after registration
        },
        error: (err) => {
          alert(`Error: ${err.error?.message || 'An error occurred'}`);
          console.error(err);
        },
      });
  }
}
