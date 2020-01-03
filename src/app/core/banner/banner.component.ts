import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BannerService } from './shared/banner.service';
import { ResponseModel } from '../../shared/shared.model';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {
  bannerImage: any;
  filenameBannerImage: string | ArrayBuffer;
  allBanners: any[] = [];
  currentBanner: any;
  constructor(private toasterService: ToastrService,
    private bannerService: BannerService) { }

  ngOnInit() {
    this.getAllImageBanners();
  }

  getAllImageBanners() {
    this.bannerService.getAllBanners().subscribe((res: ResponseModel) => {
      console.log(res);
      if (res.errors) {
        this.toasterService.error('error while fetching');
      } else {
        this.allBanners = res.data;
      }
    })
  }
  onBannerImageSelect(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      this.bannerImage = event.target.files[0];
      reader.onload = (event) => { // called once readAsDataURL is completed
        this.filenameBannerImage = event.target.result;
      }
    }
  }

  saveImage() {
    const formData = new FormData();
    formData.append('image', this.bannerImage);
    this.bannerService.addBanner(formData).subscribe((res: ResponseModel) => {
      console.log(res);
      if (res.errors) {
        this.toasterService.error('error while fetching');
      } else {
        if (res.data[0]) {
          this.allBanners.push(res.data[0]);
          console.log(this.allBanners);
          jQuery('#modal3').modal('hide');
          this.toasterService.success('Image Uploaded Successfully');
        }
      }
    })
  }

  viewBanner(index: number) {
    this.currentBanner = this.allBanners[index];
  }

  deleteBanner(index: number) {
    if (confirm('Are You Sure To Delete This Banner Image?')) {
      this.bannerService.deleteBanner(this.allBanners[index]._id).subscribe((res: ResponseModel) => {
        if (res.errors) {
          this.toasterService.error('error while fetching');
        } else {
          this.allBanners.splice(index, 1);
          this.toasterService.info('Image Deleted Successfully');
        }
      })
    }
  }

  resetForm() {
    this.filenameBannerImage = null;
    this.bannerImage = null;
  }


}
