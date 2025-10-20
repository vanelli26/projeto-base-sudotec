import { Routes } from '@angular/router';
import { Dashboard } from '@/pages/home/dashboard/dashboard';
import { AppLayout } from '@/layout/component/app.layout';

export const homeRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [{ path: 'dashboard', component: Dashboard }]
    }
];
