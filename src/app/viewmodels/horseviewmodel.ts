import { AppointmentViewmodel } from './viewmodels';
export class HorseViewmodel {

  public Name: string;
  public HorseKey: string;
  public ImageUrl: string;
  public LocalImage: string;
  public UserKey: string;
  public Appointments: AppointmentViewmodel[];

  constructor(name?: string, horsekey?: string, imageUrl?: string, localImage?: string, userKey? : string) {
    this.Name = name !== undefined ? name : '';
    this.HorseKey = horsekey !== undefined ? horsekey : '';
    this.ImageUrl = imageUrl !== undefined ? imageUrl : '';
    this.LocalImage = localImage !== undefined ? localImage : '';
    this.UserKey = userKey !== undefined ? userKey : '';
    this.Appointments = [];
  }

  public static PartialClone(data: HorseViewmodel, existing?: HorseViewmodel): HorseViewmodel {
    const horse = existing !== undefined ? existing :new HorseViewmodel() 
    horse.Name = data.Name;
    horse.ImageUrl = data.ImageUrl;
    horse.LocalImage = data.LocalImage;
    return horse;
  }
}
