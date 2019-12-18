import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TokenStorage } from '../../../../auth/token.storage';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'token': this.tokenService.getToken()
    });
    url = '/api/user';
    constructor(private http: HttpClient, private tokenService: TokenStorage) { }

    getOwnInformation() {
        return this.http.get(this.url + '/me', { headers: this.headers });
    }

    updateOwnInformation(information) {
        return this.http.put(this.url + '/me', information, { headers: this.headers });
    }
}
