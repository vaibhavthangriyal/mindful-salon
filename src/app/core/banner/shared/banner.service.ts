import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenStorage } from '../../../auth/token.storage';
// import { TokenStorage } from '../../../../auth/token.storage';


@Injectable()

export class BannerService {
    headers = new HttpHeaders({
        // 'Content-Type': 'application/json',
        'token': this.tokenService.getToken()
    });
    bannerURL = 'api/banner';
    constructor(private http: HttpClient, private tokenService: TokenStorage) { }
    
    getAllBanners() {
        return this.http.get(this.bannerURL + '/', { headers: this.headers });
    }

    addBanner(banner) {
        return this.http.post(this.bannerURL + '/', banner, { headers: this.headers });
    }

    deleteBanner(id) {
        return this.http.delete(this.bannerURL + '/' + id, { headers: this.headers });
    }
}
