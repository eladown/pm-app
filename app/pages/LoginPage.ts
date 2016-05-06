import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router-deprecated';

@Component({
    selector: 'login-page',
    directives: [ROUTER_DIRECTIVES],
    template: `
        <div class="container">
            <form class="form-signin">
                <h2 class="form-signin-heading">Please sign in</h2>
                <label for="inputEmail" class="sr-only">
                    Email address
                </label>
                <input type="email"
                       class="form-control form-signin__first-input"
                       placeholder="Email address"
                       required=""
                       autofocus=""
                       autocomplete="off">
                <label for="inputPassword" class="sr-only">
                    Password
                </label>
                <input type="password"
                       class="form-control form-signin__last-input"
                       placeholder="Password"
                       required=""
                       autocomplete="off">
                <div class="checkbox">
                    <label>
                        <input type="checkbox" value="remember-me"> Remember me
                    </label>
                </div>
                <button class="btn btn-lg btn-primary btn-block"
                        type="submit">
                    Login
                </button>
                <a class="btn btn-link btn-block"
                   [routerLink]="['SignupPage']">
                    Create new account - sign up
                </a>
            </form>
        </div>
    `,
})
export class LoginPage {
}
