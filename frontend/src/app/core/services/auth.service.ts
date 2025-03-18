import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private userSubject = new BehaviorSubject<any>(null);
  user = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  //login function
  login(form: NgForm): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, form.value).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        this.userSubject.next(response.user);
      })
    );
  }

  //register function
  register(form: NgForm): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, form.value).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        this.userSubject.next(response.user);
      })
    );
  }

  //verify email function
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-email/${token}`);
  }

  //logout function
  logout(): void {
    localStorage.removeItem('token');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  //change password function
  changePassword(form: NgForm): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, form.value)
      .pipe(
        tap((response: any) => {
          localStorage.setItem('token', response.token);
          this.userSubject.next(response.user);
        })
      );
  }

  //check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
