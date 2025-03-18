import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { Router, RouterLink } from '@angular/router';
import { ReviewService } from '../../../services/review.service';
import { SlidebarComponent } from '../../../shared/components/slidebar/slidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule, NgForm, NgModel } from '@angular/forms';

@Component({
  selector: 'app-setting',
  imports: [CommonModule, SlidebarComponent, FormsModule],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent implements OnInit {
  user: any = null;
  reviews: any[] = [];
  defaultProfilePicture: string = 'https://avatars.githubusercontent.com/u/47269252?v=1';

  passwordForm = {
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  profile = {
    email: '',
    profilePicture: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
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

  errorMessage: string = '';

 constructor(
  private userService: UserService, 
  private router: Router, 
  private reviewService: ReviewService,
  private authService: AuthService
) { }

 ngOnInit(): void {
   if (!localStorage.getItem('token')) {
     this.router.navigate(['/auth/login']);
   }
   this.userService.getProfile().subscribe(user => {
     if (!user.profileCompleted) {
       this.router.navigate(['user/complete-profile']);
     }
   });
   this.userService.getProfile().subscribe(user => {
    this.user = user;
  });
   this.reviewService.getUserReviews(this.user.userId).subscribe(reviews => { this.reviews = reviews;});
 }

 changePassword(form: NgForm): void {
    form.value.email = this.user.email;
    this.authService.changePassword(form).subscribe({
    next: () => {
      alert('Password changed successfully');
    },
    error: (error) => {
      alert('An error occurred while changing password');
      this.errorMessage = error.error.message || 'An error occurred while changing password';
    }
   });
 }

 getInterests(): (keyof typeof this.profile.interests)[] {
  return Object.keys(this.profile.interests) as (keyof typeof this.profile.interests)[];
}

  // update user profile
  updateProfile(form: NgForm): void {
    const profileData = {
      email: this.user.email,
      address: form.value.address,
      city: form.value.city,
      postalCode: form.value.postalCode,
      country: form.value.country,
      bio: form.value.bio,
      preferences: {
        Smoking: form.value.Smoking,
        Pets: form.value.Pets,
        Budget: form.value.Budget,
        RoommateGender: form.value.RoommateGender,
        Cleanliness: form.value.Cleanliness,
        NoiseTolerance: form.value.NoiseTolerance,
        WorkFromHome: form.value.WorkFromHome,
      },
      interests: {
        Music: form.value.Music,
        Sports: form.value.Sports,
        Reading: form.value.Reading,
        Gaming: form.value.Gaming,
        Cooking: form.value.Cooking,
        Gardening: form.value.Gardening,
        Traveling: form.value.Traveling,
        Photography: form.value.Photography,
        Painting: form.value.Painting,
        Dancing: form.value.Dancing
    }
  };
    this.userService.updateProfile(profileData).subscribe({
      next: () => {
        alert('Profile updated successfully');
      },
      error: (error) => {
        alert('An error occurred while updating profile');
        this.errorMessage = error?.error?.message || 'An error occurred while updating profile';
      }
    });
  }

  // delete user profile
  deleteProfile(): void {
    this.userService.deleteProfile(this.user.email).subscribe({
      next: () => {
        alert('Profile deleted successfully');
        this.router.navigate(['/auth/register']);
      },
      error: (error) => {
        alert('An error occurred while deleting profile');
        this.errorMessage = error?.error?.message || 'An error occurred while deleting profile';
      }
    });
  }

}
