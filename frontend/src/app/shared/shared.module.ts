import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { PropertyCardComponent } from './components/property-card/property-card.component';
import { SearchComponent } from './components/search/search.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    PropertyCardComponent,
    SearchComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    PropertyCardComponent,
    SearchComponent,
  ],
})
export class SharedModule {}
