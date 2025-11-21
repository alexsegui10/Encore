import { Routes } from '@angular/router';
import { AdminGuard, NonAdminGuard, AuthGuard, EnterpriseGuard } from './core/guards';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
        canActivate: [NonAdminGuard]
    },
    {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
        canActivate: [NonAdminGuard]
    },
    {
        path: 'shop',
        loadChildren: () => import('./pages/shop/shop.module').then(m => m.ShopModule),
        canActivate: [NonAdminGuard]
    },
    {
        path: 'details/:slug',
        loadComponent: () => import('./pages/details/details.component').then(m => m.DetailsComponent),
        canActivate: [NonAdminGuard]
    },
    {
        path: 'auth',
        loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule),
        canActivate: [NonAdminGuard]
    },
    {
        path: 'profile',
        loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfileModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent),
        canActivate: [AuthGuard, NonAdminGuard]
    },
    {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
        canActivate: [AuthGuard, NonAdminGuard]
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
                canActivate: [AdminGuard],
                children: [
                    {
                        path: '',
                        redirectTo: 'users',
                        pathMatch: 'full'
                    },
                    {
                        path: 'users',
                        loadComponent: () => import('./pages/admin/admin-users/admin-users.component').then(m => m.AdminUsersComponent),
                        canActivate: [AdminGuard]
                    },
                    {
                        path: 'categories',
                        loadComponent: () => import('./pages/admin/admin-categories/admin-categories.component').then(m => m.AdminCategoriesComponent),
                        canActivate: [AdminGuard]
                    },
                    {
                        path: 'events',
                        loadComponent: () => import('./pages/admin/admin-events/admin-events.component').then(m => m.AdminEventsComponent),
                        canActivate: [AdminGuard]
                    },
                    {
                        path: 'profile',
                        loadComponent: () => import('./pages/admin/admin-profile/admin-profile.component').then(m => m.AdminProfileComponent),
                        canActivate: [AdminGuard]
                    }
                ]
            },
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: 'enterprise',
        children: [
            {
                path: 'login',
                loadComponent: () => import('./pages/enterprise/enterprise-login/enterprise-login.component').then(m => m.EnterpriseLoginComponent)
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/enterprise/enterprise-dashboard/enterprise-dashboard.component').then(m => m.EnterpriseDashboardComponent),
                canActivate: [EnterpriseGuard],
                children: [
                    {
                        path: '',
                        redirectTo: 'categories',
                        pathMatch: 'full'
                    },
                    {
                        path: 'categories',
                        loadComponent: () => import('./pages/enterprise/enterprise-categories/enterprise-categories.component').then(m => m.EnterpriseCategoriesComponent),
                        canActivate: [EnterpriseGuard]
                    },
                    {
                        path: 'products',
                        loadComponent: () => import('./pages/enterprise/enterprise-products/enterprise-products.component').then(m => m.EnterpriseProductsComponent),
                        canActivate: [EnterpriseGuard]
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
