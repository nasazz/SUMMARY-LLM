import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthStore } from '../../infrastructure/auth/auth.store';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, NavbarComponent],
  host: {
    'class': 'block h-screen w-screen overflow-hidden relative'
  },
  template: `
    <div class="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden relative">
      <!-- Sidebar -->
      <app-sidebar 
        class="flex-none z-30 transition-all duration-300"
        [isCollapsed]="isSidebarCollapsed()"
        (toggleCollapse)="toggleSidebar()"
      ></app-sidebar>

      <!-- Main Content Area -->
      <main class="flex-1 relative flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <!-- Navbar -->
        <app-navbar 
            (toggleSidebar)="toggleSidebar()"
            [isSidebarCollapsed]="isSidebarCollapsed()"
        ></app-navbar>
        
        <!-- Page Content -->
        <div class="flex-1 overflow-y-auto p-0">
           <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Floating Theme Toggle (Bottom Right) -->
       <div class="absolute bottom-6 right-6 z-50">
        <button (click)="themeService.toggleTheme()"
          class="flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform duration-200 group">
          @if (themeService.darkMode()) {
            <i class="pi pi-sun text-yellow-500 text-2xl group-hover:rotate-90 transition-transform"></i>
          } @else {
            <i class="pi pi-moon text-purple-600 dark:text-purple-400 text-2xl group-hover:-rotate-12 transition-transform"></i>
          }
        </button>
      </div>

    </div>
  `
})
export class MainLayoutComponent {
  isSidebarCollapsed = signal(false);
  private authStore = inject(AuthStore);
  readonly themeService = inject(ThemeService);

  constructor() {
    // JWT is stateless — user info is already decoded from the token at login time.
  }

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }
}
