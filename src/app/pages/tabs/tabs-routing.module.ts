import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
    {
        path: 'tabs',
        component: TabsPage,
        children: [
            {
                path: 'tab1',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
                    },
                    {
                        path: 'about',
                        loadChildren: () => import('../about/about.module').then(m => m.AboutPageModule)
                    },
                    {
                        path: 'imprint',
                        loadChildren: () => import('../imprint/imprint.module').then(m => m.ImprintPageModule)
                    },
                    {
                        path: 'privacy',
                        loadChildren: () => import('../privacy/privacy.module').then(m => m.PrivacyPageModule)
                    },
                    {
                        path: 'register',
                        loadChildren: () => import('../register/register.module').then(m => m.RegisterPageModule)
                    },
                    {
                        path: 'profile',
                        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
                    },
                    {
                        path: 'horses',
                        loadChildren: () => import('../horses/horses.module').then(m => m.HorsesPageModule)
                    },
                    {
                        path: 'logout',
                        loadChildren: () => import('../logout/logout.module').then(m => m.LogoutPageModule)
                    },
                    {
                        path: 'confirmEmail',
                        loadChildren: () => import('../confirm-email/confirm-email.module').then(m => m.ConfirmEmailPageModule)
                    },
                    {
                        path: 'edithorse',
                        loadChildren: () => import('../edithorse/edithorse.module').then(m => m.EdithorsePageModule)
                    },
                    {
                        path: 'editprofile',
                        loadChildren: () => import('../editprofile/editprofile.module').then(m => m.EditprofilePageModule)
                    }
               ]
            },
            {
                path: 'tab2',
                loadChildren: () => import('../news/news.module').then(m => m.NewsPageModule)
            },
            {
                path: 'tab3',
                children: [
                    {
                        path: '',
                        loadChildren: () => import('../places/places.module').then(m => m.PlacesPageModule)
                    },
                    {
                        path: 'week',
                        loadChildren: () => import('../week/week.module').then(m => m.WeekPageModule)
                    },
                    {
                        path: 'day',
                        loadChildren: () => import('../day/day.module').then(m => m.DayPageModule)
                    },
                    {
                        path: 'privateappointment',
                        loadChildren: () => import('../privateappointment/privateappointment.module').then(m => m.PrivateAppointmentPageModule)
                    },
                    {
                        path: 'adminappointment',
                        loadChildren: () => import('../adminappointment/adminappointment.module').then(m => m.AdminappointmentPageModule)
                    },
                    {
                        path: 'otherappointment',
                        loadChildren: () => import('../otherappointment/otherappointment.module').then(m => m.OtherAppointmentPageModule)
                    },
                    {
                        path: 'create',
                        loadChildren: () => import('../create/create.module').then(m => m.CreatePageModule)
                    },
                    {
                        path: 'placedetails',
                        loadChildren: () => import('../placedetails/placedetails.module').then(m => m.PlacedetailsPageModule)
                    },
                    {
                        path: 'eventdetails',
                        loadChildren: () => import('../eventdetails/eventdetails.module').then(m => m.EventdetailsPageModule)
                    },
                    { 
                        path: 'nowinplace', 
                        loadChildren: () => import('../nowinplace/nowinplace.module').then(m => m.NowinplacePageModule) 
                    }
                ]
            },
            {
                path: '',
                redirectTo: '/tabs/tab1',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
