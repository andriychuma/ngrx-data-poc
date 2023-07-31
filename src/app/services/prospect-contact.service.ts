import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { createSelector } from '@ngrx/store';
import { combineLatest, filter, map, switchMap } from 'rxjs';
import { Entities } from '../entity-metadata';
import { ContactService } from './contact.service';
import { EntityCollectionServiceBaseExtended } from './entity-collection-service-base-extended';
import { Contact, ProspectContactLink } from './models';
import { ProspectService } from './prospect.service';

@Injectable({
  providedIn: 'root',
})
export class ProspectContactLinkService extends EntityCollectionServiceBaseExtended<ProspectContactLink> {
  currentProspectLinkedContacts$ = this.prospectService.currentProspect$.pipe(
    filter((p) => !!p),
    switchMap((p) => this.selectLinkedContacts(p!.id)),
  );

  currentProspectLinkedContactsLoaded$ =
    this.prospectService.currentProspect$.pipe(
      filter((p) => !!p),
      switchMap((p) => this.selectLinkedContactsLoaded(p!.id)),
    );

  constructor(
    serviceElementsFactory: EntityCollectionServiceElementsFactory,
    private contactService: ContactService,
    private prospectService: ProspectService,
  ) {
    super(Entities.ProspectContactLink, serviceElementsFactory);
  }

  private linkedContactsSelector = (prospectId: number) =>
    createSelector(
      this.selectors.selectEntities,
      this.contactService.selectors.selectEntityMap,
      (prospectContactLinks, contactMap) =>
        prospectContactLinks
          ?.filter((link) => link.prospectId === prospectId)
          .map((link) => contactMap[link.contactId])
          .filter((c): c is Contact => !!c) ?? [],
    );

  private linkedContactsLoadingSelector = createSelector(
    this.selectors.selectLoading,
    this.contactService.selectors.selectLoading,
    (prospectContactLinksLoading, contactsLoading) =>
      prospectContactLinksLoading || contactsLoading,
  );

  selectLinkedContacts(prospectId: number) {
    return this.store.select(this.linkedContactsSelector(prospectId));
  }

  selectLinkedContactsLoading$ = this.store.select(
    this.linkedContactsLoadingSelector,
  );

  selectLinkedContactsLoaded(prospectId: number) {
    const query = this.getContactsByProspectQueryString(prospectId);
    return combineLatest([
      this.isQueryLoaded$(query),
      this.contactService.isQueryLoaded$(query),
    ]).pipe(map((statuses) => statuses.every((status) => status)));
  }

  getLinkedContacts(prospectId: number) {
    const query = this.getContactsByProspectQueryString(prospectId);
    this.getWithQuery(query);
    return this.contactService.getWithQuery(query);
  }

  private getContactsByProspectQueryString(prospectId: number) {
    return `prospectId=${prospectId}`;
  }
}
