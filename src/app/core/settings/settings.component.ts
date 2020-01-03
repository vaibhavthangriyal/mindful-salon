import { Component, OnInit } from '@angular/core';
import { SettingsService } from './shared/settings.service';
import { ResponseModel } from '../../shared/shared.model';
import { ToastrService } from 'ngx-toastr';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  allImages: any[] = [];
  formData = new FormData();
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  constructor(private settingsService: SettingsService, private toasterService: ToastrService) { }

  ngOnInit() {
    this.getAllBannerImages();
  }


  initGallery(photos) {
    this.galleryOptions = [
      {
        imageSize: 'containe',
        width: '600px',
        height: '400px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide
      },
      // max-width 800
      {
        breakpoint: 800,
        width: '100%',
        height: '600px',
        imagePercent: 80,
        thumbnailsPercent: 20,
        thumbnailsMargin: 20,
        thumbnailMargin: 20
      },
      // max-width 400
      {
        breakpoint: 400,
        preview: false
      }
    ];
    const imageArray: any[] = [];
    for (let index = 0; index < photos.length; index++) {
      const imageObject: { small: String, medium: String, big: String } = { small: '', medium: '', big: '' };
      imageObject.small = 'https://mindful-salon.s3.ap-south-1.amazonaws.com/' + photos[index].image;
      imageObject.medium = 'https://mindful-salon.s3.ap-south-1.amazonaws.com/' + photos[index].image;
      imageObject.big = 'https://mindful-salon.s3.ap-south-1.amazonaws.com/' + photos[index].image;
      imageArray.push(imageObject);
    }
    this.galleryImages = imageArray;
    // if (this.galleryImages.length > 0) {
    //   this.imagesPresent = true;
    // } else {
    //   this.imagesPresent = false;
    // }
  }

  getAllBannerImages() {
    this.settingsService.getAllBannerImages().subscribe((res: ResponseModel) => {
      console.log(res);
      if (res.errors) {
        this.toasterService.error('Error')
      } else {
        this.allImages = res.data;
        this.initGallery(res.data); 
      }
    });
  }

  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      const formData = new FormData();
      const filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        this.formData.append('image', event.target.files[i]);
      }
    }
  }

  uploadImages() {
    this.settingsService.uploadBannerImages(this.formData).subscribe((res: ResponseModel) => {
      console.log(res);
      if (res.errors) {
        this.toasterService.error('Images Not uploaded', 'Error');
      } else {
        jQuery('#subjectDetails').modal('hide');
        this.toasterService.success('all Images are Uploaded', 'Success');
        this.initGallery(res.data);
      }
    });
  }
}
