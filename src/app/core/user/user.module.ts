import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserComponent } from './user.component';
import { RouterModule } from '@angular/router';
import { UserRoutingModule } from './shared/user.routing';
import { UserService } from './shared/user-service.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { UserroleComponent } from './userrole/userrole.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProfileComponent } from './profile/profile.component';

@NgModule({
  imports: [
    CommonModule,
    UserRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    DataTablesModule,

    InputSwitchModule
  ],
  declarations: [
    UserComponent,
    UserroleComponent,
    ProfileComponent
  ],
  exports:[
    UserRoutingModule
  ],
  providers:[
    UserService
  ]
})
export class UserModule { }
