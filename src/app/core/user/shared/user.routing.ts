import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnlyAdminUsersGuard } from '../../../admin/admin-user-guard';
import { UserComponent } from '../user.component';
import { UserroleComponent } from '../userrole/userrole.component';
import { AuthGuard } from '../../../auth/auth-guard.service';
import { ProfileComponent } from '../profile/profile.component';

const routes: Routes = [
  {
    path: 'user', children: [{ path: '', component: UserComponent, canActivate: [AuthGuard] }],
    // , canActivate: [OnlyAdminUsersGuard],
  },
  { path: 'userrole', children: [{ path: '', component: UserroleComponent, canActivate: [AuthGuard] }] }
  ,
  { path: 'profile', children: [{ path: '', component: ProfileComponent, canActivate: [AuthGuard] }] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class UserRoutingModule { }
