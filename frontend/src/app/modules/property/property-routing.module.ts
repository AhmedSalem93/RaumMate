import { CreatePropertyComponent } from './create-property/create-property.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyListComponent } from './property-list/property-list.component';

const routes: Routes = [
  { path: '', component: PropertyListComponent, pathMatch: 'full' },
  { path: 'create', component: CreatePropertyComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes), CreatePropertyComponent],
  exports: [RouterModule, CreatePropertyComponent],
})
export class PropertyRoutingModule {}
