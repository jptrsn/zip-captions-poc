import { Component } from '@angular/core';

@Component({
  selector: 'zip-captions-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public menuItems: string[] = [
    'home',
    'about',
    'credits'
  ];
}
