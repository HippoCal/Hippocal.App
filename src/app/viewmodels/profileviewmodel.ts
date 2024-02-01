import { PlaceViewmodel, HorseViewmodel } from './viewmodels';

export class ProfileViewmodel {

  public Name: string = "";
  public FirstName: string = "";
  public HorseName: string = "";
  public DisplayName: string = "";
  public ImageUrl: string = "";
  public UserKey: string = "";
  public DummyUserKey: string = "";
  public PlaceKey: string = "";
  public Email: string = "";
  public UserPin: string = "";
  public IsRegistered: boolean = false;
  public IsActive: boolean = false;
  public EmailConfirmed: boolean = false;
  public NotificationsAllowed: boolean = true;
  public IsPublicProfile: boolean = true;
  public ShowEvents: boolean = true;
  public NotificationDelay: number = 15;
  public LastNotificationId: number = 0;
  public NumLogins: number = 0;
  public LastNewsRefresh: Date = new Date;
  public CurrentPlace: PlaceViewmodel;
  public Horses: HorseViewmodel[];
  public Places: PlaceViewmodel[];


  constructor(userkey: string, placekey: string, email?: string) {
    this.UserKey = userkey;
    this.PlaceKey = placekey;
    this.Name = '';
    this.FirstName = '';
    this.HorseName = '';
    this.Email = email !== undefined ? email : '';
    this.UserPin = '';
    this.ImageUrl = '';
    this.IsRegistered = false;
    this.IsActive = false;
    this.EmailConfirmed = false;
    this.IsPublicProfile = true;
    this.ShowEvents = true;
    this.NumLogins = 0;
    this.CurrentPlace = new PlaceViewmodel("", "");
    this.Horses = [];
    this.Places = [];
    this.DummyUserKey = '';
    this.DisplayName = '';
    this.LastNewsRefresh = new Date(1);
    this.NotificationsAllowed = false;
    this.NotificationDelay = 15;
    this.LastNotificationId = 0;
  }

}
