import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MainService } from '../services/main.service';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class CollectionsService implements OnInit {
  collections: any[] = [];

  constructor(private mainService: MainService, private http: HttpClient) {}

  ngOnInit(): void {
    // this.getcollections();
  }

//   getcollections(): void {
//     this.mainService..getAll().subscribe(
//       (data) => {
//         this.collections = data;
//       },
//       (error) => {
//         console.error('Error fetching insurance companies:', error);
//       }
//     );
//   }
}

