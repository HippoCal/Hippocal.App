export class PlaceViewmodel {

  public Name: string;
  public OwnerName: string;
  public PlaceKey: string;
  public FirstHour: number;
  public LastHour: number;
  public MaxCapacity: number;
  public ImageUrl: string;
  public LocalImage: string;
  public Description: string;
  public BusinessHours: any[];
  public IsAdmin: boolean;
  public WeeksBookingInFuture: number;
  public BookableTo: string;

  constructor(name: string, placekey: string, ownerName?: string, firstHour?: number, lastHour?: number, maxCapacity?: number, imageUrl?: string, localImage?: string, isAdmin?: boolean) {
    this.Name = name;
    this.PlaceKey = placekey;
    this.OwnerName = ownerName !== undefined ? ownerName : '';
    this.FirstHour = firstHour !== undefined ? firstHour : 0;
    this.LastHour = lastHour !== undefined ? lastHour : 23;
    this.MaxCapacity = maxCapacity !== undefined ? maxCapacity : 1;
    this.ImageUrl = imageUrl !== undefined ? imageUrl : '';
    this.LocalImage = localImage !== undefined ? localImage : '';
    this.IsAdmin = isAdmin !== undefined ? isAdmin : false;
    this.Description = "";
    this.WeeksBookingInFuture = 0;
    this.BusinessHours = [];
    this.BookableTo = "";
  }

  public static Clone(data: PlaceViewmodel): PlaceViewmodel {
    var place = new PlaceViewmodel(
      data.Name,
      data.PlaceKey,
      data.OwnerName,
      data.FirstHour,
      data.LastHour,
      data.MaxCapacity,
      data.ImageUrl,
      data.LocalImage,
      data.IsAdmin,
      );
      place.Description = data.Description;
      place.WeeksBookingInFuture = data.WeeksBookingInFuture;
      place.BusinessHours = data.BusinessHours;
      place.BookableTo = data.BookableTo;
    return place;
  }

}
