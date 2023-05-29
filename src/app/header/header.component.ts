import { Component, OnDestroy, OnInit, WritableSignal, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';

interface MenuItem {
  label: string;
  routerOutlet: string;
}

@Component({
  selector: 'zip-captions-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public menuItems: MenuItem[];
  public activeRoute: WritableSignal<string>;
  private onDestroy$: Subject<void> = new Subject<void>();
  constructor(private router: Router) {
    this.activeRoute = signal(this.router.url);
    this.menuItems = [
      {
        label: 'home',
        routerOutlet: '/'
      },
      {
        label: 'about',
        routerOutlet: '/about'
      }
    ];
  }

  ngOnInit(): void {
    this.router.events.pipe(
      takeUntil(this.onDestroy$),
      filter((ev: any) => ev instanceof NavigationEnd)
    ).subscribe((ev: NavigationEnd) => {
      this.activeRoute.set(ev.url);
    })
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }
}
