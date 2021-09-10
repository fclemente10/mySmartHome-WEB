import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService, Habitacion, UserDetails, Vivienda} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import Swal from 'sweetalert2';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-infouser',
  templateUrl: './infouser.component.html',
  styleUrls: ['./infouser.component.scss']
})
export class InfouserComponent implements OnInit, OnDestroy {
  protected subscription: Subscription;
  private ngUnsubscribe = new Subject();
  emailuser = '';
  userArray = [];
  viviendaArray = [];
  habitacionArray = [];
  infoEquipoArray = [];
  decomposicion: any[] = [];
  decomposicion2: any[] = [];

  usuario: UserDetails = {
    exp: 0,
    id: 0,
    email: '',
    contrasena: '',
    nombre: '',
    apellido: '',
    tipo: ['Admin', 'Usuario']
  };
  vivienda: Vivienda = {
    id: 0,
    nombreVivienda: '',
    emailCliente: '',
    pais: '',
    ciudad: '',
    ubicacion: '',
    codigoPostal: '',
  };
  habitacion: Habitacion = {
    id: 0,
    nombreVivienda: '',
    nombreHabitacion: '',
    serialNumber: '',
  };

  constructor(private httpClient: HttpClient,
              public auth: AuthenticationService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              protected route: ActivatedRoute) {
//    this.route.params.subscribe(param => {
//      this.emailuser = param.email;
//    });
  }

  ngOnInit(): void {
    this.emailuser = localStorage.getItem('getUser');
    this.subscription = this.auth.getOneUser(this.emailuser).subscribe((data: any) => {
      this.userArray = data;
      console.log(data);
      this.decomposicion = this.userArray.map(item => {
        this.usuario.tipo = item.tipo;
        this.usuario.email = item.email;
        this.usuario.nombre = item.nombre;
        this.usuario.apellido = item.apellido;
        this.usuario.id = item.id;
      });
    })
    this.subscription = this.auth.getViviendasCliente(this.emailuser).subscribe((data: any) => {
      this.viviendaArray = data;
      console.log(data);
      this.decomposicion2 = this.viviendaArray.map(item => {
        this.vivienda.id = item.id;
        this.vivienda.nombreVivienda = item.nombreVivienda;
        this.vivienda.pais = item.pais;
        this.vivienda.ciudad = item.ciudad;
        this.vivienda.ubicacion = item.ubicacion;
        this.vivienda.codigoPostal = item.codigoPostal;
      });
    })
    this.subscription = this.auth.getHabitacionesCliente(this.emailuser).subscribe(  (data: any) => {
      this.habitacionArray = data;
      console.log (' habitacion=> ');
      console.log (data);
    })
    this.subscription = this.auth.getEquiposUsuario(this.emailuser).subscribe( (data: any) =>{
      this.infoEquipoArray = data;
      console.log (' InfoEquipo => ');
      console.log (data);
    })
  }

  btnEditarVivienda(id: string){
    console.log('vamos para pagina editar vivienda con id vivienda=', id);
    this.router.navigate(['/vivienda', id]);
  }

  btnBorrarVivienda(nombreVivienda: string){
    console.log('BTN_Borrar');
    Swal.fire({
      title: '¿Estás serguro?',
      text: 'Al borrar no podrás recuperar la vivienda',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si si, la borro!',
      cancelButtonText: 'No, me quedo'
    }).then ((result) => {
      if (result.value){
        this.auth.delVivienda(nombreVivienda).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          Swal.fire('Vivienda borrada con éxito!');
          this.reload();
        }, (err: any) => {
          console.log('err=>');
          console.log(err);
          Swal.fire('Error',
              ''+ err.message ,
              'error');
        });
      } else if (result.dismiss === Swal.DismissReason.cancel ){
        Swal.fire(
            'Cancelado',
            'su vivienda está segura',
            'error'
        )
      }
    })
  }

  btnEditarHabitacion(nombreHabitacion: string){

  }

  btnBorrarHabitacion(nombreHabitacion: string){

  }
  btnEditarEquipo(serial: string){
    console.log('vamos para pagina editar con serial=', serial);
    this.router.navigate(['/equipos', serial]);
  }
  reload() {
     console.log('reloading');
    const currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }
  ngOnDestroy(){
    this.subscription.unsubscribe();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
