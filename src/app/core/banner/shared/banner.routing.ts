import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnlyAdminUsersGuard } from '../../../admin/admin-user-guard';
import { AuthGuard } from '../../../auth/auth-guard.service';
import { BannerComponent } from '../banner.component';
const routes: Routes = [
  {
    path: 'banner', children: [{ path: '', component: BannerComponent }],
    canActivate: [AuthGuard]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class BannerRoutingModule { }
