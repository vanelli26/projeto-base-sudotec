import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { LoginService } from '@/pages/auth/login/login-service';
import { LoginInput } from '@/models/loginInput';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, ReactiveFormsModule, RouterModule, RippleModule, Toast],
    templateUrl: './login.html',
    providers: [MessageService, LoginService]
})
export class Login {
    formBuilder = inject(FormBuilder);
    messageService = inject(MessageService);
    loginService = inject(LoginService);

    loginForm = this.formBuilder.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });

    checked: boolean = false;

    validarLogin() {
        if (this.loginForm.invalid) {
            this.messageService.add({ severity: 'info', summary: 'Informação', detail: 'Usuário e Senha Incorretos' });
        }

        let loginInput = this.loginForm.value as LoginInput;

        this.loginService.login(loginInput).subscribe({
            next: (loginResponse) => {
                alert(loginResponse);
            },
            error: (err) => {
                this.messageService.add({ severity: 'warn', summary: 'Erro de Login', detail: err.error.message });
            }
        });
    }
}
