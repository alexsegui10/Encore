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
         loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'profile',
        loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule)
    },
    {
        path: 'admin',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./pages/admin/admin-login/admin-login.component').then(m => m.AdminLoginComponent)
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
                children: [
                    {
                        path: '',
                        redirectTo: 'users',
                        pathMatch: 'full'
                    },
                    {
                        path: 'users',
                        loadComponent: () => import('./pages/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
                    },
                    {
                        path: 'categories',
                        loadComponent: () => import('./pages/admin/admin-categories/admin-categories.component').then(m => m.AdminCategoriesComponent)
                    },
                    {
                        path: 'events',
                        loadComponent: () => import('./pages/admin/admin-events/admin-events.component').then(m => m.AdminEventsComponent)
                    },
                    {
                        path: 'profile',
                        loadComponent: () => import('./pages/admin/admin-profile/admin-profile.component').then(m => m.AdminProfileComponent)
                    }
                ]
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
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
