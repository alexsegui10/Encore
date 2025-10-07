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
    {
        path: 'shop',
        loadChildren: () => import('./pages/shop/shop.module').then(m => m.ShopModule)
    },
    {
        path: 'details/:slug',
        loadComponent: () => import('./pages/details/details.component').then(m => m.DetailsComponent)
    },
    {
        path: 'auth',
        loadChildren: () => import('./pages/auth/auth-routing.module').then(m => m.AuthRoutingModule)
    }
    // {
    //     path: 'products',
    //     loadChildren: () => import('./modules/products/products.routes').then(m => m.routes)
    // },
    // {
    //     path: '**',
    //     loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
    // }
];
