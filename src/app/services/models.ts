export interface Prospect {
  id: number;
  name: string;
  contactIds: number[];
}

export interface Healthcheck {
  id: number;
  name: string;
  prospectId: number;
}

export interface Contact {
  id: number;
  name: string;
}

export interface ProspectContactLink {
  prospectId: number;
  contactId: number;
}
