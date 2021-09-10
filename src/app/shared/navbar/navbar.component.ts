import {Component, OnDestroy, OnInit} from '@angular/core';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthenticationService, TokenPayload} from '../../services/authentication.service';
import Swal from 'sweetalert2';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: [
  ]
})
export class NavbarComponent implements OnInit, OnDestroy {
  isCollapsed = true;
  myuser = '';
  classIsSet = false;
  loginForm: FormGroup;
  invalidLogin = false;
  message = '';
  auxUser =  [];
  decomposicion: any [] = [];
  verifyAdmin = '';
  credentials: TokenPayload = {
    email: '',
    contrasena: ''
  };
  protected subscription: Subscription;

  constructor(public auth: AuthenticationService,
              private router: Router,
              private formBuilder: FormBuilder ) { }

  ngOnInit(): void {
    this.auth.logout();
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required])],
      contrasena: ['', Validators.required]
    });
  }
  getUser() {
    this.myuser = localStorage.getItem('userName');
    return this.myuser;
  }

  toggleClass()
  {
    this.classIsSet = ! this.classIsSet;
  }

  onSubmit() {
    // if (this.loginForm.value) {
    //    return;
    //   }
    this.credentials = {
      email: this.loginForm.controls.email.value,
      contrasena: this.loginForm.controls.contrasena.value
    };
    localStorage.setItem('userName', this.credentials.email);

    this.subscription = this.auth.profile(this.credentials.email).subscribe((data: any) => {
      this.auxUser = data;
      console.log('info user =>');
      console.log(this.auxUser);
      this.decomposicion = this.auxUser.map(item => {
        this.verifyAdmin = item.tipo;
        console.log('tipo user =>' + this.verifyAdmin );
        if (this.verifyAdmin === 'Admin'){
          this.login();
        } else {
          Swal.fire('Por favor utilice la App de su móvil');
        }
      });
    });
  }

  login() {
    this.subscription = this.auth.login(this.credentials).subscribe(() => {
          this.router.navigateByUrl('/landing');
        },
        err => {
          console.error(err);
          this.invalidLogin = true;
        });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
