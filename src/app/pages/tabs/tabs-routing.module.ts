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
                    { path: '', loadChildren: () => import('../home/home.module').then(m => m.HomePageModule) },
                    { path: 'about', loadChildren: () => import('../about/about.module').then(m => m.AboutPageModule) },
                    { path: 'confirm-email', loadChildren: () => import('../confirm-email/confirm-email.module').then(m => m.ConfirmEmailPageModule) },
                    { path: 'edithorse', loadChildren: () => import('../edithorse/edithorse.module').then(m => m.EdithorsePageModule) },
                    { path: 'horses', loadChildren: () => import('../horses/horses.module').then(m => m.HorsesPageModule) },
                    { path: 'logout', loadChildren: () => import('../logout/logout.module').then(m => m.LogoutPageModule) },
                    { path: 'editprofile', loadChildren: () => import('../editprofile/editprofile.module').then(m => m.EditprofilePageModule) },                 
                    { path: 'getEmail', loadChildren: () => import('../get-email/get-email.module').then(m => m.GetEmailPageModule) },
                    { path: 'home', loadChildren: () => import('../home/home.module').then(m => m.HomePageModule) },
                    { path: 'imprint', loadChildren: () => import('../imprint/imprint.module').then(m => m.ImprintPageModule) },
                    { path: 'nowinplace', loadChildren: () => import('../nowinplace/nowinplace.module').then(m => m.NowinplacePageModule) },
                    { path: 'pin-input', loadChildren: () => import('../pin-input/pin-input.module').then(m => m.PinInputPageModule) },
                    { path: 'privacy', loadChildren: () => import('../privacy/privacy.module').then(m => m.PrivacyPageModule) },
                    { path: 'profile', loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule) },
                    { path: 'register', loadChildren: () => import('../register/register.module').then(m => m.RegisterPageModule) },
                    { path: 'adminappointment', loadChildren: () => import('../adminappointment/adminappointment.module').then(m => m.AdminappointmentPageModule) },
                    { path: 'privateappointment', loadChildren: () => import('../privateappointment/privateappointment.module').then(m => m.PrivateAppointmentPageModule) },
                    { path: 'appointment', loadChildren: () => import('../appointment/appointment.module').then(m => m.AppointmentPageModule) },
                    { path: 'create', loadChildren: () => import('../create/create.module').then(m => m.CreatePageModule) },
                    { path: 'day', loadChildren: () => import('../day/day.module').then(m => m.DayPageModule) },
                    { path: 'eventdetails', loadChildren: () => import('../eventdetails/eventdetails.module').then(m => m.EventdetailsPageModule) },
                    { path: 'imageview', loadChildren: () => import('../imageview/imageview.module').then(m => m.ImageviewPageModule) },
                    { path: 'otherappointment', loadChildren: () => import('../otherappointment/otherappointment.module').then(m => m.OtherAppointmentPageModule) },
                    { path: 'placedetails', loadChildren: () => import('../placedetails/placedetails.module').then(m => m.PlacedetailsPageModule) },
                    { path: 'places', loadChildren: () => import('../places/places.module').then(m => m.PlacesPageModule) },
                    { path: 'week', loadChildren: () => import('../week/week.module').then(m => m.WeekPageModule) },
                    { path: 'news', loadChildren: () => import('../news/news.module').then(m => m.NewsPageModule) },
                    { path: 'newsdetails', loadChildren: () => import('../newsdetails/newsdetails.module').then(m => m.NewsdetailsPageModule) }
                ]
            },
            {
                path: 'tab2',
                children: [
                    { path: '', loadChildren: () => import('../news/news.module').then(m => m.NewsPageModule) },
                    { path: 'home', loadChildren: () => import('../home/home.module').then(m => m.HomePageModule) },
                    { path: 'news', loadChildren: () => import('../news/news.module').then(m => m.NewsPageModule) },
                    { path: 'newsdetails', loadChildren: () => import('../newsdetails/newsdetails.module').then(m => m.NewsdetailsPageModule) }
                ]
            },
            {
                path: 'tab3',
                children: [
                    { path: '', loadChildren: () => import('../places/places.module').then(m => m.PlacesPageModule) },
                    { path: 'home', loadChildren: () => import('../home/home.module').then(m => m.HomePageModule) },
                    { path: 'adminappointment', loadChildren: () => import('../adminappointment/adminappointment.module').then(m => m.AdminappointmentPageModule) },
                    { path: 'privateappointment', loadChildren: () => import('../privateappointment/privateappointment.module').then(m => m.PrivateAppointmentPageModule) },
                    { path: 'appointment', loadChildren: () => import('../appointment/appointment.module').then(m => m.AppointmentPageModule) },
                    { path: 'create', loadChildren: () => import('../create/create.module').then(m => m.CreatePageModule) },
                    { path: 'day', loadChildren: () => import('../day/day.module').then(m => m.DayPageModule) },
                    { path: 'eventdetails', loadChildren: () => import('../eventdetails/eventdetails.module').then(m => m.EventdetailsPageModule) },
                    { path: 'imageview', loadChildren: () => import('../imageview/imageview.module').then(m => m.ImageviewPageModule) },
                    { path: 'nowinplace', loadChildren: () => import('../nowinplace/nowinplace.module').then(m => m.NowinplacePageModule) },
                    { path: 'otherappointment', loadChildren: () => import('../otherappointment/otherappointment.module').then(m => m.OtherAppointmentPageModule) },
                    { path: 'placedetails', loadChildren: () => import('../placedetails/placedetails.module').then(m => m.PlacedetailsPageModule) },
                    { path: 'places', loadChildren: () => import('../places/places.module').then(m => m.PlacesPageModule) },
                    { path: 'week', loadChildren: () => import('../week/week.module').then(m => m.WeekPageModule) }
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
export class TabsPageRoutingModule { }
