import { BehaviorSubject, Observable } from 'rxjs';
import { of as observableOf } from 'rxjs';

import { Injectable } from '@angular/core';
import { OrdersChart, OrdersChartData } from '../data/orders-chart';
import { OrderProfitChartSummary, OrdersProfitChartData } from '../data/orders-profit-chart';
import { ProfitChart, ProfitChartData } from '../data/profit-chart';
import { UsersService } from '../../services/users.service';
// ...

@Injectable()
export class OrdersProfitChartService extends OrdersProfitChartData {

  private initialSummary: OrderProfitChartSummary[] = [
    { title: 'Offers Created', value: 3654 },
    { title: 'Customers', value: 946 },
    { title: 'Customers older than 40 years old', value: 654 },
    { title: 'Femails', value: 230 },
    { title: 'Males', value: 230 },
  ];

  private summarySubject = new BehaviorSubject<OrderProfitChartSummary[]>(this.initialSummary);

  constructor(
    private ordersChartService: OrdersChartData,
    private usersService: UsersService,
    private profitChartService: ProfitChartData
  ) {
    super();

    this.usersService.pullReports().subscribe(
      (response) => {
        console.log('reports:', response);

        const titleMap: Record<string, string> = {
          'Offers': 'Offers Created',
          'Customers': 'Customers',
          'Customers older than 40 years old': 'Customers older than 40 years old',
          'Females': 'Femails',
          'Males': 'Males',
        };

        const updatedSummary = this.initialSummary.map(item => {
          // console.log('response:', response);
          // const incoming = response.find(r => titleMap[r.title] === item.title);
          // return {
          //   ...item,
          //   value: incoming ? incoming.value : item.value,
          // };
        });

        // Push new value to the observable
        // this.summarySubject.next(updatedSummary);
      },
      (error) => {
        console.error('reports entry:', error);
      }
    );
  }

  getOrderProfitChartSummary(): Observable<OrderProfitChartSummary[]> {
    return this.summarySubject.asObservable();
  }

  getOrdersChartData(period: string): Observable<OrdersChart> {
    return observableOf(this.ordersChartService.getOrdersChartData(period));
  }

  getProfitChartData(period: string): Observable<ProfitChart> {
    return observableOf(this.profitChartService.getProfitChartData(period));
  }
}
