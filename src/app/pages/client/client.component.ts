import {ChangeDetectorRef, Component, OnInit, AfterViewInit, ViewChild, OnDestroy} from '@angular/core';
import { HttpParams, HttpClient } from '@angular/common/http';
import {Observable, Subscription} from 'rxjs';
import {AuthenticationService, UserDetails} from '../../services/authentication.service';
import {isNumeric} from 'rxjs/internal-compatibility';
import {DatePipe} from '@angular/common';
import { formatDate } from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import Swal from 'sweetalert2';
import {FormControl, FormGroup, NgForm, Validators, ReactiveFormsModule, FormBuilder} from '@angular/forms';


@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styles: []
})

export class ClientComponent implements OnInit, OnDestroy  {
  error = false;
  messageError = '';
  submit: boolean;
  protected subscriptions = [];
  protected subscription: Subscription;

  arrayUser = [];
  decomposicion: any [] = [];
  message: any;
  formulario: FormGroup;
  nombresProhibidos = ['Test', 'test', 'TEST', 'Prueba', 'prueba', 'PRUEBA'];
  checkContrasena = '';
  creat: boolean;

  usuario: UserDetails = {
    exp: 0,
    id: 0,
    email: '',
    contrasena: '',
    nombre: '',
    apellido: '',
    tipo: ['Admin', 'Usuario']
  };

  constructor(private httpClient: HttpClient,
              public auth: AuthenticationService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              protected route: ActivatedRoute, ) {
    this.formulario =  new FormGroup({
      userData: new FormGroup({
        // id: new FormControl(null, [Validators.required]),
        email: new FormControl(null, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]),
        nombre:  new FormControl(null, [Validators.required, this.esProhibido.bind(this)]),
        apellido:  new FormControl(null, [Validators.required, this.esProhibido.bind(this)]),
        contrasena: new FormControl(null, [Validators.required, Validators.minLength(6)]),
        checkContrasena: new FormControl(null, [Validators.required, Validators.minLength(6)]),
        tipo: new FormControl(null, [Validators.required]),
      })
    });

  }

  @ViewChild('f', {static: false}) FormGroup: NgForm;

  ngOnInit(): void {
    console.log('Pagina Clientes' );
    this.subscription = this.auth.getUsu().subscribe((data: any) => {
      this.arrayUser = data;
    });

    if (!this.auth.isLoggedIn()) {
      Swal.fire('Para ver usuarios es necesario una sección!');
      this.router.navigateByUrl('/home');
    }
    this.submit = false;
    this.creat = false;
  }
  /************ EDITAR **************/
  btnEditar(email: string){
    this.submit = true;
    this.creat = false;
    this.subscription = this.auth.profile(email).subscribe((data: any) => {
      this.arrayUser = data;
      console.log('info user =>');
      console.log(this.arrayUser);
      this.decomposicion = this.arrayUser.map(item => {
        this.usuario.tipo = item.tipo;
        this.usuario.nombre = item.nombre;
        this.usuario.apellido = item.apellido;
        this.usuario.contrasena = item.contrasena;
        this.checkContrasena = item.contrasena;
        this.usuario.email = item.email;
        this.usuario.id = item.id;
      });
      console.log('this.formulario=> ');
      console.log(this.formulario);
    });
    /*    localStorage.setItem('email', email.toString());
        const userOrDevice = 'user';
        this.router.navigate(['/editar', userOrDevice]);
    */
  }

  btnCancel(){
    this.reload();
  }

  btnDetalle(email: string){
    console.log('vamos para pagina editar con id usuario=', email);
    localStorage.setItem('getUser', email);
   // this.router.navigate(['/infouser', email]);
    this.router.navigateByUrl('/infouser');
  }

  btnBorrar(email: string) {
    Swal.fire({
      title: '¿Estás serguro?',
      text: 'Al borrar no podrás recuperar el usuario',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si si, lo borre!',
      cancelButtonText: 'No, me quedo'
    }).then ((result) => {
      if (result.value){
        this.subscription =  this.auth.delUsuario(email).subscribe(() => {
          Swal.fire('Usuario borrado con éxito!');
          this.reload();
        }, err => {
          console.error(err);
          Swal.fire('Antes de borrar un usuario es necesario borrar sus viviendas, habitaciones y equipos', '' + err.message, 'error');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel ){
        Swal.fire(
            'Cancelado',
            'el usuario está seguro',
            'error'
        )
      }
    })
  }
  btnAnadirUsu(){
    this.submit = true;
    this.creat = true;
    console.log('btnAnadirUsu');
  }
  onSubmitCreat(){
    this.usuario.contrasena = this.formulario.value.userData.contrasena;
    this.checkContrasena = this.formulario.value.userData.checkContrasena;
    if (this.usuario.contrasena === this.checkContrasena ){
      //  this.usuario.id = null;
      this.usuario.nombre = this.formulario.value.userData.nombre;
      this.usuario.apellido = this.formulario.value.userData.apellido;
      this.usuario.contrasena = this.formulario.value.userData.contrasena;
      this.usuario.email = this.formulario.value.userData.email;
      this.usuario.tipo = this.formulario.value.userData.tipo;

      if (this.creat){
        this.subscription = this.auth.register(this.usuario).subscribe((data: any) => {
          Swal.fire('Usuario registrado con éxito!');
          this.creat = false;
          this.reload();

        }, (err: any) => {
          console.log('err=>');
          console.log(err);
          Swal.fire('Error',
              ''+ err.message ,
              'error');
        });
      }else{
        this.subscription = this.auth.putUsuario(this.usuario).subscribe(() => {
          Swal.fire('Usuario editado con éxito!');
          this.reload();
        }, (err: any) => {
          console.log('err=>');
          console.log(err);
          Swal.fire('Error',
              ''+ err.message ,
              'error');
        });
      }

    } else{
      Swal.fire('Las contrasenas NO son iguales');
    }
  }
  onSubmitEdit(){
    console.error('Dentro SubmitEdit');
  }

  esProhibido(nombre: FormControl): {[s: string]: boolean} {
    if (this.nombresProhibidos.indexOf(nombre.value) !== -1) {
      return  {nombreEsProhibido: true};
    }
    return null;
  }
  password(formGroup: FormGroup) {
    const { value: contrasena } = formGroup.get('contrasena');
    const { value: checkContrasena } = formGroup.get('checkContrasena');
    return contrasena === checkContrasena ? null : { passwordNotMatch: true };
  }

  public reload() {
    this.submit = false;
    console.error('reloading');
    const currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }
  public ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
    this.subscription.unsubscribe();
  }
}
