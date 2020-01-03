import { Component, OnInit } from '@angular/core';
import { ProfileService } from './shared/profile.service';
import { ResponseModel } from '../../../shared/shared.model';
import { ToastrService } from 'ngx-toastr';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  confirmPassword: string;
  passwordMatched: Boolean = false;
  registerForm: FormGroup;
  submitted: Boolean = false;
  me: any;
  profilePicture: any;
  filenameProfilePicture: string | ArrayBuffer;
  constructor(private profileService: ProfileService, private toasterService: ToastrService, private formBuilder: FormBuilder,
    private titleService: Title) {
    this.getInformation();
    this.titleService.setTitle('Mindful Salon | Profile');
  }

  ngOnInit() {
    this.initProfileForm();
  }

  initProfileForm() {
    this.registerForm = this.formBuilder.group({
      full_name: ['', Validators.required],
      email: ['', Validators.required],
      is_active: [true],
      password: ['', Validators.required],
      role: ['', Validators.required],
      mobile_number: ['', Validators.required],
      landmark: ['', Validators.required],
      street_address: ['', Validators.required],
      city: ['', Validators.required],
      profile_picture: [''],
      dob: [new Date(), Validators.required],
      gender: ['']
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  getInformation() {
    this.profileService.getOwnInformation().subscribe((res: ResponseModel) => {
      console.log(res);
      if (res.errors) {
        this.toasterService.error('Error Whil Updating', 'Try again');
      } else {
        this.me = res.data;
        this.setFormValue(res.data);
      }
    });
  }

  setFormValue(user) {
    console.log(user);
    if (user.email) {
      this.registerForm.controls['email'].setValue(user.email);
    }
    if (user.full_name) {
      this.registerForm.controls['full_name'].setValue(user.full_name);
    }
    if (user.role) {
      this.registerForm.controls['role'].setValue(user.role._id);
    }
    if (user.mobile_number) {
      this.registerForm.controls['mobile_number'].setValue(user.mobile_number);
    }
    if (user.dob) {
      const dob = user.dob.substring(0, 10);
      this.registerForm.controls['dob'].setValue(dob);
    } else {
      this.registerForm.controls['dob'].setValue(new Date());
    }
    if (user.gender) {
      this.registerForm.controls['gender'].setValue(user.gender);
    }
    if (user.landmark) {
      this.registerForm.controls['landmark'].setValue(user.landmark);
    }
    if (user.password) {
      this.registerForm.controls['password'].setValue(user.password);
    }
    if (user.street_address) {
      this.registerForm.controls['street_address'].setValue(user.street_address);
    }
    if (user.city) {
      this.registerForm.controls['city'].setValue(user.city);
    }
    if (user.profile_picture) {
      this.registerForm.controls['profile_picture'].setValue(user.profile_picture);
    }
  }

  onSubmit() {
    console.log(this.registerForm);
    let registerFormData = new FormData();
    if (this.registerForm.get('password').value == '') {
      this.registerForm.removeControl('password');
    }
    Object.keys(this.registerForm.controls).forEach(control => {
      registerFormData.append(control, this.registerForm.get(control).value);
    });
    if(this.profilePicture) {
      registerFormData.append('profile_picture', this.profilePicture);
    }
    this.profileService.updateOwnInformation(registerFormData).subscribe((res: ResponseModel) => {
      console.log(res);
      if (res.errors) {
        this.toasterService.error('Error Whil Updating', 'Try again');
      } else {
        this.me = res.data;
        this.toasterService.success('Updated', 'Success');
        jQuery('#editForm').modal('hide');
        this.registerForm.reset();
        this.initProfileForm();
        this.setFormValue(res.data);
      }
    });
  }

  onImageSelect(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      this.profilePicture = event.target.files[0];
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.filenameProfilePicture = event.target.result;
      }
    }
  }

  checkPassword() { }
  selectGender(event) {
    console.log(event);
  }
}
