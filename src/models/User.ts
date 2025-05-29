export interface DriverProfile {
  style: string;
  roads: string;
  frequency: string;
  state: string;
  city: string;
}

export interface UserProfile {
  email: string;
  driverProfile: DriverProfile;
  createdAt: any;   
}
