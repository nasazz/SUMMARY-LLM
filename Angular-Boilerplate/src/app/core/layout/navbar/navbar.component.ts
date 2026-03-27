import { Component, EventEmitter, inject, output, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthStore } from '../../../infrastructure/auth/auth.store';
import { PopoverModule } from 'primeng/popover'

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule, PopoverModule],
    templateUrl: './navbar.component.html',
    host: {
        'class': 'block w-full'
    },
    styles: [`
        :host ::ng-deep .p-popover-arrow {
            display: none !important;
        }
    `]
})
export class NavbarComponent {
    toggleSidebar = output<void>();
    isSidebarCollapsed = input<boolean>(false);
    isUserMenuOpen = signal(false);

    readonly store = inject(AuthStore);
}
