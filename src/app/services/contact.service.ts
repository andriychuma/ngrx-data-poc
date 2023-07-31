import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { Entities } from '../entity-metadata';
import { EntityCollectionServiceBaseExtended } from './entity-collection-service-base-extended';
import { Contact } from './models';

@Injectable({
  providedIn: 'root',
})
export class ContactService extends EntityCollectionServiceBaseExtended<Contact> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super(Entities.Contact, serviceElementsFactory);
  }
}
