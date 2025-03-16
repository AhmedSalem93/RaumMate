import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { count } from 'rxjs';

@Component({
  selector: 'app-view-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnInit {
  user: any = null;
  reviews: any[] = [];

  errorMessage = '';
  email: string = '';
  defaultProfilePicture: string = 'https://avatars.githubusercontent.com/u/47269252?v=1';

  constructor( private router: Router, private userService: UserService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/auth/login']);
    }
    this.email = this.route.snapshot.paramMap.get('email') || '';
    this.userService.getViewProfile(this.email).subscribe(user => this.user = user);
    console.log('user = ' + this.user);
    //this.reviewService.getUserReviews(this.user.userId).subscribe(reviews => { this.reviews = reviews;});
  }

  
  getPreferencesKeys(): (keyof typeof this.user.preferences)[] {
    if (this.user && this.user.preferences) {
      return Object.keys(this.user.preferences) as (keyof typeof this.user.preferences)[];
    }
    return [];
  }

  getInterestsKeys(): (keyof typeof this.user.interests)[] {
    if (this.user && this.user.interests) {
      return Object.keys(this.user.interests) as (keyof typeof this.user.interests)[];
    }
    return [];
  }

  formatKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }
  
}
