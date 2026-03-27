import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

import { ThemeService } from '../../../core/services/theme.service';

@Component({
    selector: 'app-checklist-selection',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        CardModule,
        ButtonModule,
        RippleModule,
        TooltipModule,
        MenuModule
    ],
    templateUrl: './checklist-selection.html',
})
export class ChecklistSelectionComponent {
    private router = inject(Router);
    readonly themeService = inject(ThemeService);

    // Mock Data for now
    checklists = signal([
        { id: 1, title: 'Morning Shift Inspection', description: 'Daily routine checks for the morning shift.', lastUpdated: '2 hours ago', status: 'In Progress' },
        { id: 2, title: 'Server Room Maintenance', description: 'Weekly server room cooling and power check.', lastUpdated: '1 day ago', status: 'Completed' },
        { id: 3, title: 'Network Security Audit', description: 'Monthly security protocol verification.', lastUpdated: '3 days ago', status: 'Pending' },
    ]);

    menuItems: MenuItem[] = [
        {
            label: 'Options',
            items: [
                {
                    label: 'Edit',
                    icon: 'pi pi-pencil',
                },
                {
                    label: 'Delete',
                    icon: 'pi pi-trash',
                    styleClass: 'text-red-500'
                }
            ]
        }
    ];

    createNewChecklist() {
        console.log('Create new checklist clicked');
        // this.router.navigate(['/app/checklist/new']);
    }

    continueChecklist(id: number) {
        console.log('Continue checklist', id);
        // this.router.navigate(['/app/checklist', id]);
    }
}
