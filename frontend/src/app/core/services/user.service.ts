import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/api/users';
  private userSubject = new BehaviorSubject<any>(null);
  user = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  //get user profile
  getProfile(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.get(`${this.apiUrl}/profile`, { headers })
      .pipe(
        tap((response: any) => {
          this.userSubject.next(response.user);
        })
      );
      
  }

  //update user profile
  updateProfile(form: any): Observable<any> { 
    return this.http.put(`${this.apiUrl}/profile`, form)
      .pipe(
        tap((response: any) => {
          this.userSubject.next(response.user);
        })
      );
  }

  //delete user profile
  deleteProfile(): Observable<any> {  
    return this.http.delete(`${this.apiUrl}/profile`)
      .pipe(
        tap(() => {
          this.userSubject.next(null);
          this.router.navigate(['/login']);
        })
      );
  }

  //complete user profile
  completeProfile(form: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    return this.http.post(`${this.apiUrl}/complete-profile`, form, { headers })
      .pipe(
        tap((response: any) => {
          this.userSubject.next(response.user);
        })
      );
  }

  //get user preferences
  getPreferences(): Observable<any> {
    return this.http.get(`${this.apiUrl}/preferences`)
      .pipe(
        tap((response: any) => {
          this.userSubject.next(response.user);
        })
      );
  }

  //update user preferences
  updatePreferences(form: any): Observable<any> {   
    return this.http.put(`${this.apiUrl}/preferences`, form)
      .pipe(
        tap((response: any) => {
          this.userSubject.next(response.user);
        })
      );
  }

  //delete user preferences
  deletePreferences(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/preferences`)
      .pipe(
        tap(() => {
          this.userSubject.next(null);
        })
      );
  }




}
