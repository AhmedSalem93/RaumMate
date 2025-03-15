import { Component, inject, Input, OnInit } from '@angular/core';
import { PropertyService } from '../../../core/services/property.service';
import { Property } from '../property.model';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './property-list.component.html',
  styleUrl: './property-list.component.scss',
})
export class PropertyListComponent {
  @Input({ required: true }) properties!: Property[];
  constructor() {
    console.log('Property List Component Initialized');
  }
}
