import { Component } from '@angular/core';
import { map } from 'rxjs';
import { ContactService } from './services/contact.service';
import { HealthcheckService } from './services/healthcheck.service';
import { ProspectContactLinkService } from './services/prospect-contact.service';
import { ProspectService } from './services/prospect.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  currentProspectId$ = this.prospectService.currentProspect$.pipe(
    map((p) => p?.id),
  );

  constructor(
    public prospectService: ProspectService,
    public healthcheckService: HealthcheckService,
    public contactService: ContactService,
    public prospectContactLinkService: ProspectContactLinkService,
  ) {}

  getHealthchecksByProspect(prospectId: number) {
    this.prospectService.setCurrentProspect(prospectId);
    this.healthcheckService.getHealthchecks(prospectId);
  }

  getContactsByProspect(prospectId: number) {
    this.prospectService.setCurrentProspect(prospectId);
    this.prospectService.getContacts(prospectId);
  }

  selectContactsByProspectLoaded(prospectId: number) {
    return this.prospectService.selectContactsLoaded(prospectId);
  }

  getLinkedContactsByProspect(prospectId: number) {
    this.prospectService.setCurrentProspect(prospectId);
    this.prospectContactLinkService.getLinkedContacts(prospectId);
  }

  selectLinkedContactsByProspectLoaded(prospectId: number) {
    return this.prospectContactLinkService.selectLinkedContactsLoaded(
      prospectId,
    );
  }
}
