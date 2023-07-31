import { Injectable } from '@angular/core';
import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
} from '@ngrx/data';
import { createSelector } from '@ngrx/store';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  filter,
  map,
  switchMap,
} from 'rxjs';
import { Entities } from '../entity-metadata';
import { ContactService } from './contact.service';
import { Contact, Prospect } from './models';

/**
 * In many-to-many relationships, the entity service that holds links to another entity is
 * responsible for loading the referred entities and providing the drill-down API for accessing
 * them.
 */
@Injectable({
  providedIn: 'root',
})
export class ProspectService extends EntityCollectionServiceBase<Prospect> {
  private currentProspectId = new BehaviorSubject<number | null>(null);

  currentProspect$ = combineLatest([
    this.currentProspectId,
    this.entityMap$,
  ]).pipe(map(([id, prospects]) => (id !== null ? prospects[id] : null)));

  currentProspectContacts$ = this.currentProspectId.pipe(
    filter((id) => !!id),
    switchMap((id) => this.selectContacts(id!)),
  );

  currentProspectContactsLoaded$ = this.currentProspectId.pipe(
    filter((id) => !!id),
    switchMap((id) => this.selectContactsLoaded(id!)),
  );

  constructor(
    serviceElementsFactory: EntityCollectionServiceElementsFactory,
    private contactService: ContactService,
  ) {
    super(Entities.Prospect, serviceElementsFactory);
  }

  setCurrentProspect(id: number) {
    if (this.currentProspectId.value !== id) {
      this.currentProspectId.next(id);
    }
  }

  /**
   * Builds a selector that returns the contacts for a given prospect
   */
  private contactsSelector = (prospectId: number) =>
    createSelector(
      this.selectors.selectEntityMap,
      this.contactService.selectors.selectEntityMap,
      (prospectMap, contactMap) =>
        prospectMap[prospectId]?.contactIds
          ?.map((id) => contactMap[id])
          .filter((c): c is Contact => !!c) ?? [],
    );

  /**
   * Returns an observable of the contacts for a given prospect
   */
  selectContacts(prospectId: number): Observable<Contact[]> {
    return this.store.select(this.contactsSelector(prospectId));
  }

  /**
   * Returns an observable of whether the contacts for a given prospect are loaded
   */
  selectContactsLoaded(prospectId: number): Observable<boolean> {
    const query = this.getContactsByProspectQueryString(prospectId);
    return this.contactService.isQueryLoaded$(query);
  }

  getContacts(prospectId: number) {
    const query = this.getContactsByProspectQueryString(prospectId);
    return this.contactService.getWithQuery(query);
  }

  private getContactsByProspectQueryString(prospectId: number) {
    return `prospectId=${prospectId}`;
  }
}
