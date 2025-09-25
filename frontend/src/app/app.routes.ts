import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
    },
    // {
    //     path: 'about',
    //     loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent)
    // },
    // {
    //     path: 'products',
    //     loadChildren: () => import('./modules/products/products.routes').then(m => m.routes)
    // },
    // {
    //     path: '**',
    //     loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
    // }
];
