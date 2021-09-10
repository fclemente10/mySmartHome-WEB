import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-alarm',
  templateUrl: './alarm.component.html',
  styles: [
  ]
})
export class AlarmComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  infoAlarmArray = [];
  serial = '';

  constructor(private httpClient: HttpClient,
              public auth: AuthenticationService,
              private cdr: ChangeDetectorRef,
              private router: Router,
              protected route: ActivatedRoute,) {

    this.route.params.subscribe(param => {
      this.serial = param.serial;
    });

    this.auth.getAlarm().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.infoAlarmArray = data;
      console.log(' Alarms=> ');
      console.log(data);
    });
  }

  ngOnInit(): void {
  }
  btnBorrar(serial: string){
    console.log('BTN_Borrar');
    Swal.fire({
      title: '¿Estás serguro?',
      text: 'Serán borrados todas las alarmas del equipo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si si, lo borre!',
      cancelButtonText: 'No, me quedo'
    }).then ((result) => {
      if (result.value){
        this.auth.delAlarm(serial).pipe(takeUntil(this.ngUnsubscribe)).subscribe((resp) => {
      Swal.fire('Alarmas borradas con éxito!');
    }, err => {
      console.error(err);
      Swal.fire(err.errorMessage);
    });
      } else if (result.dismiss === Swal.DismissReason.cancel ){
        Swal.fire(
            'Cancelado',
            'el equipo está seguro',
            'error'
        )
      }
    });
    this.reload();
  }

  reload() {
    console.error('reloading');
    const currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
