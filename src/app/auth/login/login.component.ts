import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../auth.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router, private formBuilder: FormBuilder,
    private toaster: ToastrService,
    private titleService: Title) {
    this.titleService.setTitle('Login');
  }

  email: string;
  password: string;
  login_form: FormGroup;
  ngOnInit() {
  }

  login(): void {
    this.authService.login(this.email, this.password)
      .subscribe((data) => {
        if (data.error) {
          console.log(data.error)
          this.toaster.error("Check Email or Password", "Validation Error")
        } else {
          this.router.navigateByUrl('/home')
          window.open('/home' , '_self');
        }
      })
  }
}
