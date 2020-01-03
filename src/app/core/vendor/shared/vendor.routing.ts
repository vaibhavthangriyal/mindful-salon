import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnlyAdminUsersGuard } from '../../../admin/admin-user-guard';
import { AuthGuard } from '../../../auth/auth-guard.service';
import { VendorComponent } from '../vendor.component';
import { CalllogComponent } from '../calllog/calllog.component';

const routes: Routes = [
    {
        path: 'vendor', children: [{ path: '', component: VendorComponent, canActivate: [AuthGuard] }],
        // , canActivate: [OnlyAdminUsersGuard], 
    },
    {
        path: 'calllog', children: [{ path: '', component: CalllogComponent, canActivate: [AuthGuard] }],
        // , canActivate: [OnlyAdminUsersGuard], 
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class VendorRoutingModule { }
