import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { interval } from "rxjs/internal/observable/interval";
import { filter, timeInterval } from 'rxjs/operators';
import { Subscription, Subject } from 'rxjs';
import { AppService } from './app.service';
import { ConnectionService } from 'ng-connection-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy{

  private isConnected: boolean = true; 
  private isFocused: boolean = true; 
  private forceRefresh = new Subject<boolean>();
  private subscriptions: Subscription[] = [];
  
  @HostListener('window:focus', ['$event'])
  onFocus(event: any): void {
    this.isFocused = true;
    this.forceRefresh.next(true);
    console.log('focus');
  }

  @HostListener('window:blur', ['$event'])
  onBlur(event: any): void {
    this.isFocused = false;
    this.forceRefresh.next(false);
    console.log('blur');
  }

  constructor(
    private appService: AppService,
    private connectionService: ConnectionService
    ) {}
   
  ngOnInit(): void {
    //1. Сервіс повинен робити запит на API з інтервалом в 10 секунд.
    this.subscriptions.push(interval(10000).subscribe(() => {
      this.getData();
    }));

    this.connectionService.monitor().subscribe(isConnected => {  
      if (isConnected) {      
        this.isConnected = true;
        console.log('сonnected => ' + isConnected);    
      }  
      else { 
        this.isConnected = false;
        console.log('сonnected => ' + isConnected); 
     }  
    })  
    
    //4. Сервіс повинен миттєво відправляти запит, якщо вкладка була неактивна більше 10 секунд і стала активною.
    this.subscriptions.push(this.forceRefresh.pipe(
      timeInterval(),
      filter(f => f.interval > 10000 && f.value)
    ).subscribe(i => {
        this.getData();
        console.log('forceRefresh!!!');
    }))
  }

  private getData() {
    //2. Сервіс не повинен робити запит, якщо немає інтернет з'єднання.
    //3. Сервіс не повинен робити запит, якщо вкладка браузера неактивна.
    if (this.isConnected && this.isFocused){
      this.appService.getDataFromServer().subscribe(response => 
        console.log(response.body));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
}