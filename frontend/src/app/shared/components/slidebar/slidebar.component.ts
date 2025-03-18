import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-slidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './slidebar.component.html',
  styleUrl: './slidebar.component.scss'
})
export class SlidebarComponent {
  defaultProfilePicture: string = 'https://avatars.githubusercontent.com/u/47269252?v=1';
  @Input() user: any;
  @Input() reviews: any[] = [];
  constructor() { }

}
