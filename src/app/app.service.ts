import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(protected http: HttpClient) { }

  getDataFromServer() {
    return this.http.get('https://jsonplaceholder.typicode.com/todos/1', { observe: 'response' });
 }
}
