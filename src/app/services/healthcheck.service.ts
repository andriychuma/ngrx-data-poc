import { Injectable } from '@angular/core';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';
import { createSelector } from '@ngrx/store';
import { filter, switchMap } from 'rxjs';
import { Entities } from '../entity-metadata';
import { EntityCollectionServiceBaseExtended } from './entity-collection-service-base-extended';
import { Healthcheck } from './models';
import { ProspectService } from './prospect.service';

@Injectable({
  providedIn: 'root',
})
export class HealthcheckService extends EntityCollectionServiceBaseExtended<Healthcheck> {
  currentProspectHealthchecks$ = this.prospectService.currentProspect$.pipe(
    filter((p) => !!p),
    switchMap((p) => this.selectHealthchecks(p!.id)),
  );
  currentProspectHealthchecksLoaded$ =
    this.prospectService.currentProspect$.pipe(
      filter((p) => !!p),
      switchMap((p) => this.selectHealthchecksLoaded(p!.id)),
    );

  constructor(
    serviceElementsFactory: EntityCollectionServiceElementsFactory,
    private prospectService: ProspectService,
  ) {
    super(Entities.Healthcheck, serviceElementsFactory);
  }

  private healthchecksByProspectIdSelector = (prospectId: number) =>
    createSelector(
      this.selectors.selectEntities,
      (healthchecks) =>
        healthchecks?.filter((h) => h.prospectId === prospectId) ?? [],
    );

  selectHealthchecks(prospectId: number) {
    return this.store.select(this.healthchecksByProspectIdSelector(prospectId));
  }

  getHealthchecks(prospectId: number) {
    const query = this.getHealthchecksByProspectQueryString(prospectId);
    return this.getWithQuery(query);
  }

  selectHealthchecksLoaded(prospectId: number) {
    const query = this.getHealthchecksByProspectQueryString(prospectId);
    return this.isQueryLoaded$(query);
  }

  private getHealthchecksByProspectQueryString(prospectId: number) {
    return `prospectId=${prospectId}`;
  }
}
