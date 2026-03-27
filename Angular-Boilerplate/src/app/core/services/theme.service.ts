import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {

    darkMode = signal<boolean>(false);

    constructor() {
        this.initTheme();
    }

    toggleTheme() {
        this.darkMode.update(val => !val);
        this.applyTheme();
    }

    setTheme(isDark: boolean) {
        this.darkMode.set(isDark);
        this.applyTheme();
    }

    private initTheme() {
        // Check local storage or system preference
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            this.darkMode.set(storedTheme === 'dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.darkMode.set(prefersDark);
        }
        this.applyTheme();
    }

    private applyTheme() {
        const isDark = this.darkMode();
        const html = document.querySelector('html');

        if (isDark) {
            html?.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            html?.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }
}
