import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenStorage } from '../../../auth/token.storage';

@Injectable({
    providedIn: 'root'
})

export class SettingsService {
    bannerURL = 'api/banner';
    headers = new HttpHeaders({
        // 'Content-Type': 'application/json',
        'token': this.tokenService.getToken()
    });
    constructor(private http: HttpClient, private tokenService: TokenStorage) {

    }

    getAllBannerImages() {
        return this.http.get(this.bannerURL, { headers: this.headers });
    }

    uploadBannerImages(images) {
        return this.http.post(this.bannerURL, images, { headers: this.headers });
    }
}
