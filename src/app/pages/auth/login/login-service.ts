import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginInput, LoginResponse } from '@/models/loginInput';

@Injectable()
export class LoginService {
    private loginApi: string = 'http://localhost:8080/api/login';

    http = inject(HttpClient);

    login(loginInput: LoginInput) {
        return this.http.post<LoginResponse>(this.loginApi, loginInput);
    }
}
