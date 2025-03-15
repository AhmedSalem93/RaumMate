import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { count } from 'rxjs';

@Component({
  selector: 'app-complete-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './complete-profile.component.html',
  styleUrls: ['./complete-profile.component.scss']
})
export class CompleteProfileComponent implements OnInit {
  user: any = null;
  profile = {
    profilePicture: '',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    dateofBirth: '',
    bio: '',
    preferences: {
      Smoking: 'No',
      Pets: 'Yes',
      Budget: '',
      RoommateGender: 'No Preference',
      Cleanliness: 'Medium',
      NoiseTolerance: 'Medium',
      WorkFromHome: 'Yes',
    },
    interests: {
      Music: false,
      Sports: false,
      Reading: false,
      Gaming: false,
      Cooking: false,
      Gardening: false,
      Traveling: false,
      Photography: false,
      Painting: false,
      Dancing: false
    }
  };
  defaultProfilePicture: string = 'https://avatars.githubusercontent.com/u/47269252?v=1';

  errorMessage = '';

  constructor( private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/auth/login']);
    }
    // if user.profilecompleted is true, redirect them to the profile page
    this.userService.getProfile().subscribe(user => {
      if (user.profileCompleted) {
        this.router.navigate(['user/profile']);
      }
    });
    this.userService.getProfile().subscribe(user => this.user = user);
  }

  getInterests(): (keyof typeof this.profile.interests)[] {
    return Object.keys(this.profile.interests) as (keyof typeof this.profile.interests)[];
  }

  submitProfile() {    
    this.userService.completeProfile(this.profile).subscribe({
      next: () => this.router.navigate(['user/profile']),
      error: err => {
        this.errorMessage = err.error.message || 'An error occurred while completing your profile';
        console.error(err);
      }
    });
  }
}
