import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthStore } from '../../../infrastructure/auth/auth.store';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TooltipModule],
  templateUrl: './sidebar.component.html',
  host: {
    'class': 'block h-full'
  }
})
export class SidebarComponent {
  store = inject(AuthStore);
  private router = inject(Router);

  isCollapsed = input<boolean>(false);
  toggleCollapse = output<void>();

  // Signal to trigger updates on navigation
  private navTrigger = signal(0);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.navTrigger.update(v => v + 1);
      }
    });
  }

  isTabActive(tabName: string): boolean {
    // Read signal to register dependency
    this.navTrigger();

    // Parse the authoritative router URL
    const url = this.router.url;
    const tree = this.router.parseUrl(url);

    // 1. Check if we are in Settings
    // We check path segments roughly, or just string inclusion for simplicity but robustness
    // Using parseUrl is better. 
    // root -> children(primary) -> segments
    // Let's stick to the robust string check for path, and parsed check for params.
    if (!url.includes('/app/settings')) return false;

    // 2. Check Tab Param
    // Ensure we handle 'null' or undefined if the param is missing
    const currentTab = tree.queryParams['tab'];
    return currentTab === tabName;
  }

  onToggle() {
    this.toggleCollapse.emit();
  }
}
