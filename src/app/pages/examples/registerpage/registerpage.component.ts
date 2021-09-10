import {Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef, ViewChild} from '@angular/core';
import {AuthenticationService, UserDetails} from '../../../services/authentication.service';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import Swal from 'sweetalert2';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-registerpage',
  templateUrl: 'registerpage.component.html'
})
export class RegisterpageComponent implements OnInit, OnDestroy {
  isCollapsed = true;
  focus;
  focus1;
  focus2;

  protected subscription: Subscription;
  usuario: UserDetails = {
    exp: 0,
    id: 0,
    email: '',
    contrasena: '',
    nombre: '',
    apellido: '',
    tipo: ['Admin', 'Usuario']
  };
  formulario: FormGroup;
  nombresProhibidos = ['Test', 'test', 'TEST', 'Prueba', 'prueba', 'PRUEBA'];
  checkContrasena = '';
  submit: boolean;


  constructor(private httpClient: HttpClient,
              public auth: AuthenticationService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              protected route: ActivatedRoute) {
    this.formulario =  new FormGroup({
      userData: new FormGroup({
        // id: new FormControl(null, [Validators.required]),
        email: new FormControl(null, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
        nombre:  new FormControl(null, [Validators.required, this.esProhibido.bind(this)]),
        apellido:  new FormControl(null, [Validators.required, this.esProhibido.bind(this)]),
        contrasena: new FormControl(null, [Validators.required, Validators.minLength(6)]),
        checkContrasena: new FormControl(null, [Validators.required, Validators.minLength(6)]),
        tipo: new FormControl(null, null),
        cb: new FormControl(false, [Validators.required, Validators.requiredTrue]),
      })
    });
  }
  @ViewChild('f', {static: false}) FormGroup: NgForm;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    const squares1 = document.getElementById('.square1');
    const squares2 = document.getElementById('.square2');
    const squares3 = document.getElementById('.square3');
    const squares4 = document.getElementById('.square4');
    const squares5 = document.getElementById('.square5');
    const squares6 = document.getElementById('.square6');
    const squares7 = document.getElementById('.square7');
    const squares8 = document.getElementById('.square8');

    const posX = e.clientX - window.innerWidth / 2;
    const posY = e.clientY - window.innerWidth / 6;

    squares1.style.transform =
      'perspective(500px) rotateY(' +
      posX * 0.05 +
      'deg) rotateX(' +
      posY * -0.05 +
      'deg)';
    squares2.style.transform =
      'perspective(500px) rotateY(' +
      posX * 0.05 +
      'deg) rotateX(' +
      posY * -0.05 +
      'deg)';
    squares3.style.transform =
      'perspective(500px) rotateY(' +
      posX * 0.05 +
      'deg) rotateX(' +
      posY * -0.05 +
      'deg)';
    squares4.style.transform =
      'perspective(500px) rotateY(' +
      posX * 0.05 +
      'deg) rotateX(' +
      posY * -0.05 +
      'deg)';
    squares5.style.transform =
      'perspective(500px) rotateY(' +
      posX * 0.05 +
      'deg) rotateX(' +
      posY * -0.05 +
      'deg)';
    squares6.style.transform =
      'perspective(500px) rotateY(' +
      posX * 0.05 +
      'deg) rotateX(' +
      posY * -0.05 +
      'deg)';
    squares7.style.transform =
      'perspective(500px) rotateY(' +
      posX * 0.02 +
      'deg) rotateX(' +
      posY * -0.02 +
      'deg)';
    squares8.style.transform =
      'perspective(500px) rotateY(' +
      posX * 0.02 +
      'deg) rotateX(' +
      posY * -0.02 +
      'deg)';
  }

  ngOnInit() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.add('register-page');
    this.submit = true;

    this.onMouseMove(event);
  }

  get g() { return this.formulario.controls; }

  onSubmitCreat() {
    this.usuario.contrasena = this.formulario.value.userData.contrasena;
    this.checkContrasena = this.formulario.value.userData.checkContrasena;
    if (this.usuario.contrasena === this.checkContrasena) {
      //  this.usuario.id = null;
      this.usuario.nombre = this.formulario.value.userData.nombre;
      this.usuario.apellido = this.formulario.value.userData.apellido;
      this.usuario.contrasena = this.formulario.value.userData.contrasena;
      this.usuario.email = this.formulario.value.userData.email;
      this.formulario.value.userData.tipo = 'Usuario';
      this.usuario.tipo = this.formulario.value.userData.tipo;

      this.subscription = this.auth.register(this.usuario).subscribe((data: any) => {
        Swal.fire('Usted a sido registrado con éxito!');
//        this.reload(); enviar usuario para pagina de bienvenido
        this.router.navigateByUrl('/profile');
      }, (err: any) => {
        console.log('err=>');
        console.log(err.error);
        Swal.fire('Error',
              'Usuario ya registrado',
//            '' + err.error,
            'error');
      });
    } else {
      Swal.fire('Las contrasenas NO son iguales');
    }
  }
  esProhibido(nombre: FormControl): {[s: string]: boolean} {
    if (this.nombresProhibidos.indexOf(nombre.value) !== -1) {
      return  {nombreEsProhibido: true};
    }
    return null;
  }
  btnCancel(){
    this.router.navigateByUrl('/home');
  }

  ngOnDestroy() {
    const body = document.getElementsByTagName('body')[0];
    body.classList.remove('register-page');
      this.subscription.unsubscribe();
  }
}
