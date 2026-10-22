import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { delay, takeWhile } from 'rxjs/operators';
import { LayoutService } from '../../../../@core/utils/layout.service';
import { UsersService } from '../../../../services/users.service';


@Component({
  selector: 'ngx-visitors-statistics',
  styleUrls: ['./visitors-statistics.component.scss'],
  templateUrl: './visitors-statistics.component.html',
})
export class ECommerceVisitorsStatisticsComponent implements AfterViewInit, OnDestroy {

  private alive = true;

  @Input() value: number;

  option: any = {};
  chartLegend: { iconColor: string; title: string }[];
  echartsIntance: any;
  chartdata:any;
  males:any;
  females:any;
  old:any;

  constructor(private theme: NbThemeService,
              private layoutService: LayoutService,
              private usersService:UsersService
            ) {
    this.layoutService.onSafeChangeLayoutSize()
      .pipe(
        takeWhile(() => this.alive),
      )
      .subscribe(() => this.resizeChart());
  }

  ngAfterViewInit() {
    this.theme.getJsTheme()
      .pipe(
        takeWhile(() => this.alive),
        delay(1),
      )
      .subscribe(config => {
        const variables: any = config.variables;
        const visitorsPieLegend: any = config.variables.visitorsPieLegend;

        this.setOptions(variables);
        this.setLegendItems(visitorsPieLegend);
        this.getOrdersChartData('month');
    });
    
  }

  getOrdersChartData(period: string) {
    this.usersService.pullReports()
      .pipe(takeWhile(() => this.alive))
      .subscribe(ordersChartData => {
        console.log(ordersChartData, 'ordersChartData');
        this.chartdata = ordersChartData;
        
        // Get total count of males and females
        const total = ordersChartData.Males + ordersChartData.Females;
        
        // Calculate percentages
        this.males = total > 0 ? Math.round((ordersChartData.Males / total) * 100) : 0;
        this.females = total > 0 ? Math.round((ordersChartData.Females / total) * 100) : 0;
        this.old=ordersChartData['Customers older than 40 years old'];
        console.log(this.males, this.females, 'male female');

        // Update chart options with new values
        this.theme.getJsTheme()
          .pipe(
            takeWhile(() => this.alive),
            delay(1),
          )
          .subscribe(config => {
            const variables: any = config.variables;
            this.setOptions(variables);
          });
      });
  }
  setLegendItems(visitorsPieLegend) {
    this.chartLegend = [
      {
        iconColor: '#1890ff', // Light blue to match male segment
        title: 'Males',
      },
      {
        iconColor: '#52c41a', // Light green to match female segment
        title: 'Females',
      },
    ];
  }

  setOptions(variables) {
    const visitorsPie: any = variables.visitorsPie;

    this.option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%',
      },
      series: [
        {
          name: 'Gender Distribution',
          clockWise: true,
          hoverAnimation: false,
          type: 'pie',
          center: ['50%', '50%'],
          radius: ['50%', '70%'],
          data: [
            {
              value: this.males,
              name: 'Males',
              label: {
                normal: {
                  position: 'center',
                  formatter: `${this.males}%`,
                  textStyle: {
                    fontSize: '22',
                    fontFamily: variables.fontSecondary,
                    fontWeight: '600',
                    color: variables.fgHeading,
                  },
                },
              },
              tooltip: {
                show: true,
              },
              itemStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: '#1890ff', // Light blue
                    },
                    {
                      offset: 1,
                      color: '#096dd9', // Darker blue
                    },
                  ]),
                  shadowColor: 'rgba(0, 0, 0, 0.1)',
                  shadowBlur: 0,
                  shadowOffsetX: 0,
                  shadowOffsetY: 3,
                },
              },
              hoverAnimation: false,
            },
            {
              value: this.females,
              name: 'Females',
              tooltip: {
                show: true,
              },
              label: {
                normal: {
                  position: 'inner',
                },
              },
              itemStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: '#52c41a', // Light green
                    },
                    {
                      offset: 1,
                      color: '#389e0d', // Darker green
                    },
                  ]),
                  shadowColor: 'rgba(0, 0, 0, 0.1)',
                  shadowBlur: 0,
                  shadowOffsetX: 0,
                  shadowOffsetY: 3,
                },
              },
            },
          ],
        },
      ],
    };
  }

  onChartInit(echarts) {
    this.echartsIntance = echarts;
  }

  resizeChart() {
    if (this.echartsIntance) {
      this.echartsIntance.resize();
    }
  }

  ngOnDestroy() {
    this.alive = false;
  }
}
