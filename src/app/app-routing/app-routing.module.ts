import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../auth/auth-guard.service';
import { HomeComponent } from '../home/home.component';
import { MaintainanceComponent } from '../extra/maintainance/maintainance.component';
import { LoginComponent } from '../auth/login/login.component';
import { RegisterComponent } from '../auth/register/register.component';
import { SettingsComponent } from '../core/settings/settings.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  // { path: 'auth', loadChildren: 'app/auth/auth.module#AuthModule', canActivate: [AuthGuard] },
  // { path: 'admin', loadChildren: 'app/admin/admin.module#AdminModule' },
  { path: 'login', component: LoginComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'signup', component: RegisterComponent },
  { path: 'oops', component: MaintainanceComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
  declarations: []
})

export class AppRoutingModule { }
