import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [ 
  { path: '', loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule) },
  { path: 'about', loadChildren: () => import('./pages/about/about.module').then(m => m.AboutPageModule) },
  { path: 'adminappointment', loadChildren: () => import('./pages/adminappointment/adminappointment.module').then(m => m.AdminappointmentPageModule) },
  { path: 'privateappointment', loadChildren: () => import('./pages/privateappointment/privateappointment.module').then(m => m.PrivateAppointmentPageModule) },
  { path: 'appointment', loadChildren: () => import('./pages/appointment/appointment.module').then(m => m.AppointmentPageModule) },
  { path: 'confirm-email', loadChildren: () => import('./pages/confirm-email/confirm-email.module').then(m => m.ConfirmEmailPageModule) },
  { path: 'create', loadChildren: () => import('./pages/create/create.module').then(m => m.CreatePageModule) },
  { path: 'day', loadChildren: () => import('./pages/day/day.module').then(m => m.DayPageModule) },
  { path: 'edithorse', loadChildren: () => import('./pages/edithorse/edithorse.module').then(m => m.EdithorsePageModule) },
  { path: 'horses', loadChildren: () => import('./pages/horses/horses.module').then(m => m.HorsesPageModule) },
  { path: 'logout', loadChildren: () => import('./pages/logout/logout.module').then(m => m.LogoutPageModule) },
  { path: 'editprofile', loadChildren: () => import('./pages/editprofile/editprofile.module').then(m => m.EditprofilePageModule) },
  { path: 'eventdetails', loadChildren: () => import('./pages/eventdetails/eventdetails.module').then(m => m.EventdetailsPageModule) },
  { path: 'getEmail', loadChildren: () => import('./pages/get-email/get-email.module').then(m => m.GetEmailPageModule) },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule) },
  { path: 'imageview', loadChildren: () => import('./pages/imageview/imageview.module').then(m => m.ImageviewPageModule) },
  { path: 'imprint', loadChildren: () => import('./pages/imprint/imprint.module').then(m => m.ImprintPageModule) },
  { path: 'news', loadChildren: () => import('./pages/news/news.module').then(m => m.NewsPageModule) },
  { path: 'newsdetails', loadChildren: () => import('./pages/newsdetails/newsdetails.module').then(m => m.NewsdetailsPageModule) },
  { path: 'nowinplace', loadChildren: () => import('./pages/nowinplace/nowinplace.module').then(m => m.NowinplacePageModule) },
  { path: 'otherappointment', loadChildren: () => import('./pages/otherappointment/otherappointment.module').then(m => m.OtherAppointmentPageModule) },
  { path: 'pin-input', loadChildren: () => import('./pages/pin-input/pin-input.module').then(m => m.PinInputPageModule) },
  { path: 'placedetails', loadChildren: () => import('./pages/placedetails/placedetails.module').then(m => m.PlacedetailsPageModule) },
  { path: 'places', loadChildren: () => import('./pages/places/places.module').then(m => m.PlacesPageModule) },
  { path: 'privacy', loadChildren: () => import('./pages/privacy/privacy.module').then(m => m.PrivacyPageModule) },
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule) },
  { path: 'register', loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule) },
  { path: 'start', loadChildren: () => import('./pages/start/start.module').then(m => m.StartPageModule) },
  { path: 'tabs', loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule) },
  { path: 'week', loadChildren: () => import('./pages/week/week.module').then(m => m.WeekPageModule) }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
