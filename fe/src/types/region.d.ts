export type Region = {
  id: string;
  title: string;
  country: string;
  pilot_nuts1: string;
  pilot_nuts1_label: string;
  pilot_nuts2?: string;
  pilot_nuts2_label?: string;
  pilot_nuts3?: string;
  pilot_nuts3_label?: string;
  pilot: string;
  pilot_geoserver?: string;
  maps?: {
    [tabName: string]: string[];
  };
  charts?: {
    [tabName: string]: string[];
  };
};
