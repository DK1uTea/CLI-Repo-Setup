export type LocationStatus = "ACTIVE" | "INACTIVE";

export type Location = {
  id: string;
  createdAt: string;
  updatedAt: string;
  locationName: string;
  street: string;
  street2: string | null;
  city: string;
  postcode: string;
  state: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  status: LocationStatus;
  userId: string;
  country: string;
}

export const eventAddressMap: Location[] = [
  {
    "id": "cmpywriun000fmr0ud636mz4m",
    "createdAt": "2026-06-04T03:00:50.351Z",
    "updatedAt": "2026-06-04T03:00:50.351Z",
    "locationName": "Duncan Larsen",
    "street": "Inventore enim provi",
    "street2": null,
    "city": "Incididunt ut volupt",
    "postcode": "84130",
    "state": "",
    "countryCode": "DE",
    "latitude": 0,
    "longitude": 0,
    "status": "ACTIVE",
    "userId": "d21a7f65-de63-46c1-a25c-d282ed546ecd",
    "country": "Germany"
  },
  {
    "id": "cmpv4kud6000eqk0umnmvrhpr",
    "createdAt": "2026-06-01T11:28:30.907Z",
    "updatedAt": "2026-06-01T11:28:30.907Z",
    "locationName": "Shelly Nelson",
    "street": "Autem et aliquip mag",
    "street2": null,
    "city": "Placeat vitae corru",
    "postcode": "68690",
    "state": "",
    "countryCode": "DE",
    "latitude": 0,
    "longitude": 0,
    "status": "ACTIVE",
    "userId": "2b4095bf-26c9-4c54-96db-6930edaa5b26",
    "country": "Germany"
  },
  {
    "id": "cmpamgbei0019ld0u3m2nek3p",
    "createdAt": "2026-05-18T03:05:43.099Z",
    "updatedAt": "2026-05-18T03:05:43.099Z",
    "locationName": "Badezentrum Sindelfingen Edit",
    "street": "Hohenzollernstraße 23",
    "street2": null,
    "city": "Sindelfingen",
    "postcode": "71067",
    "state": "",
    "countryCode": "DE",
    "latitude": 0,
    "longitude": 0,
    "status": "ACTIVE",
    "userId": "52c72780-9312-447c-bdc3-0e7d46930800",
    "country": "Germany"
  },
  {
    "id": "cmov8lico0000o30uhqovyhbh",
    "createdAt": "2026-05-07T08:41:18.120Z",
    "updatedAt": "2026-05-17T04:37:52.105Z",
    "locationName": "Gesellschaftshaus Palmengarten",
    "street": "Palmengartenstraße 11",
    "street2": null,
    "city": "Frankfurt am Mai",
    "postcode": "60325",
    "state": "FAM",
    "countryCode": "DE",
    "latitude": 50.1217509,
    "longitude": 8.6568473,
    "status": "ACTIVE",
    "userId": "920dce0b-58e4-4cce-b602-ca565e4f0cd3",
    "country": "Germany"
  },
  {
    "id": "cmou4qfs3010an00tq3dg855i",
    "createdAt": "2026-05-06T14:05:23.427Z",
    "updatedAt": "2026-05-06T14:05:23.427Z",
    "locationName": "Braunschweiger Tennis Und Hockey Club",
    "street": "Friedrich-Kreiß-Weg 4",
    "street2": null,
    "city": "Braunschweig",
    "postcode": "31102",
    "state": "",
    "countryCode": "DE",
    "latitude": 0,
    "longitude": 0,
    "status": "ACTIVE",
    "userId": "b0b4095f-f918-4244-8093-4d77b229307a",
    "country": "Germany"
  },
  {
    "id": "cmou3q4nf00yyn00t991hphwp",
    "createdAt": "2026-05-06T13:37:09.387Z",
    "updatedAt": "2026-05-06T13:37:09.387Z",
    "locationName": "Owl Arena",
    "street": "Roger-Federer-Allee 4",
    "street2": null,
    "city": "Halle",
    "postcode": "33790",
    "state": "",
    "countryCode": "DE",
    "latitude": 0,
    "longitude": 0,
    "status": "ACTIVE",
    "userId": "b0b4095f-f918-4244-8093-4d77b229307a",
    "country": "Germany"
  },
  {
    "id": "cmou2fl3100xin00tn7gcs55y",
    "createdAt": "2026-05-06T13:00:57.853Z",
    "updatedAt": "2026-05-06T13:00:57.853Z",
    "locationName": "Mewa Arena Mainz",
    "street": "Aachener Straße 999",
    "street2": null,
    "city": "Köln",
    "postcode": "50933",
    "state": "",
    "countryCode": "DE",
    "latitude": 0,
    "longitude": 0,
    "status": "ACTIVE",
    "userId": "b0b4095f-f918-4244-8093-4d77b229307a",
    "country": "Germany"
  },
  {
    "id": "cmotuctn800v1n00t46623wug",
    "createdAt": "2026-05-06T09:14:52.053Z",
    "updatedAt": "2026-05-17T04:37:41.262Z",
    "locationName": "Reitstadion Aachen",
    "street": "Albert-Servaris-Allee50 - Tor 7",
    "street2": null,
    "city": "Aachen",
    "postcode": "52085",
    "state": "AAE",
    "countryCode": "DE",
    "latitude": 50.7955364,
    "longitude": 6.0942621,
    "status": "ACTIVE",
    "userId": "b0b4095f-f918-4244-8093-4d77b229307a",
    "country": "Germany"
  },
  {
    "id": "cmoh6cvl1000ktf0tgm9nwtej",
    "createdAt": "2026-04-27T12:29:49.670Z",
    "updatedAt": "2026-04-27T12:29:49.670Z",
    "locationName": "Radialsystem",
    "street": "Holzmarktstraße 33",
    "street2": null,
    "city": "Berlin",
    "postcode": "10243",
    "state": "",
    "countryCode": "DE",
    "latitude": 0,
    "longitude": 0,
    "status": "ACTIVE",
    "userId": "920dce0b-58e4-4cce-b602-ca565e4f0cd3",
    "country": "Germany"
  },
  {
    "id": "cmo8nvj7r0031pa0u2qzph28h",
    "createdAt": "2026-04-21T13:30:17.992Z",
    "updatedAt": "2026-04-21T13:30:17.992Z",
    "locationName": "Sagasser-Vertriebs Gmbh",
    "street": "Gärtnersleite 5",
    "street2": null,
    "city": "Coburg",
    "postcode": "96450",
    "state": "",
    "countryCode": "DE",
    "latitude": 0,
    "longitude": 0,
    "status": "ACTIVE",
    "userId": "d45773f8-3922-483a-b5f1-8bc98c104bf8",
    "country": "Germany"
  }
]