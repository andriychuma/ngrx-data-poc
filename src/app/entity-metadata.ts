import { EntityDataModuleConfig, EntityMetadataMap } from '@ngrx/data';
import { ProspectContactLink } from './services/models';

export enum Entities {
  Prospect = 'prospect',
  Healthcheck = 'healthcheck',
  Contact = 'contact',
  ProspectContactLink = 'prospectContactLink',
}

const entityMetadata: EntityMetadataMap = {
  [Entities.Prospect]: {},
  [Entities.Healthcheck]: {},
  [Entities.Contact]: {},
  [Entities.ProspectContactLink]: {
    selectId: (link: ProspectContactLink) =>
      `${link.prospectId}-${link.contactId}`,
  },
};

export const entityConfig: EntityDataModuleConfig = {
  entityMetadata,
};
