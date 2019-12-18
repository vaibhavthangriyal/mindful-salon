import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { MatIconRegistry } from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";


import { AuthService } from './auth/auth.service';
import { ProfileService } from './core/user/profile/shared/profile.service';
import { ResponseModel } from './shared/shared.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnChanges {

  private userSubscription: Subscription;
  public user: any;
  public loggedin: boolean;
  array: any = [];
  constructor(
    public authService: AuthService,
    private router: Router,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private profileService: ProfileService
  ) {
    this.array = this.authService.userData;
    this.registerSvgIcons();
    this.user = localStorage.getItem('user');
    this.profileService.getOwnInformation().subscribe((res: ResponseModel) => {
      if (res.errors) {
        console.log('ERROR');
      } else {
        this.user = res.data;
        console.log(res.data);
      }
    });
  }

  ngOnChanges() {
    if (localStorage.get('token') != null) {
      this.loggedin = true;
    } else {
      this.loggedin = false;
    }
    this.authService.$userSource.subscribe((user) => {
      console.log(user);
      this.user = user;
      this.loggedin = true;
    });
  }

  ngOnInit() {
  }

  logout(): void {
    this.loggedin = !this.loggedin;
    this.authService.signOut();
    this.navigate('/auth/login');
  }

  navigate(link): void {
    this.router.navigate([link]);
  }



  registerSvgIcons() {
    [
      'close',
      'add',
      'add-blue',
      'airplane-front-view',
      'air-station',
      'balloon',
      'boat',
      'cargo-ship',
      'car',
      'catamaran',
      'clone',
      'convertible',
      'delete',
      'drone',
      'fighter-plane',
      'fire-truck',
      'horseback-riding',
      'motorcycle',
      'railcar',
      'railroad-train',
      'rocket-boot',
      'sailing-boat',
      'segway',
      'shuttle',
      'space-shuttle',
      'steam-engine',
      'suv',
      'tour-bus',
      'tow-truck',
      'transportation',
      'trolleybus',
      'water-transportation',
    ].forEach((icon) => {
      this.matIconRegistry.addSvgIcon(icon, this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icon}.svg`));
    });
  }

}
