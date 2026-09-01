export type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
};

export type LocationState = {
  selectedAddress: Address | null;
  savedAddresses: Address[];
};
