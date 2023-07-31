import { HttpParams, HttpParamsOptions } from '@angular/common/http';
import {
  EntityActionOptions,
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
  EntitySelectors$,
} from '@ngrx/data';
import {
  BehaviorSubject,
  Observable,
  Subject,
  distinctUntilChanged,
  shareReplay,
} from 'rxjs';
import { sortQueryString } from './query-params-helper';

export class EntityCollectionServiceBaseExtended<
  T,
  S$ extends EntitySelectors$<T> = EntitySelectors$<T>,
> extends EntityCollectionServiceBase<T, S$> {
  // Maps query strings to loaded entity ids
  private queryToLoadedIds = new Map<string, (string | number)[]>();

  // Maps query strings to loaded state observables
  private queryToLoadedState = new Map<string, BehaviorSubject<boolean>>();

  constructor(
    entityName: string,
    serviceElementsFactory: EntityCollectionServiceElementsFactory,
  ) {
    super(entityName, serviceElementsFactory);
  }

  isQueryLoaded$(query: string | HttpParamsOptions): Observable<boolean> {
    const sortedQueryString = this.getSortedQueryString(query);
    const loadedSubject = this.getOrCreateLoadedStateSubject(sortedQueryString);
    return loadedSubject.asObservable().pipe(distinctUntilChanged());
  }

  isQueryLoaded(query: string | HttpParamsOptions): boolean {
    const sortedQueryString = this.getSortedQueryString(query);
    const loadedSubject = this.getOrCreateLoadedStateSubject(sortedQueryString);
    return loadedSubject.value;
  }

  private getSortedQueryString(query: string | HttpParamsOptions): string {
    if (typeof query === 'string') {
      return sortQueryString(query);
    }
    const params = new HttpParams(query);
    return sortQueryString(params.toString());
  }

  private getOrCreateLoadedStateSubject(
    sortedQueryString: string,
  ): BehaviorSubject<boolean> {
    if (!this.queryToLoadedState.has(sortedQueryString)) {
      const loadedSubject = new BehaviorSubject<boolean>(false);
      this.queryToLoadedState.set(sortedQueryString, loadedSubject);
    }
    return this.queryToLoadedState.get(sortedQueryString)!;
  }

  override getWithQuery(
    queryString: string,
    options?: EntityActionOptions,
  ): Observable<T[]> {
    const query = options?.httpOptions?.httpParams ?? queryString;
    const sortedQueryString = this.getSortedQueryString(query);

    let result = new Subject<T[]>();
    super.getWithQuery(queryString, options).subscribe((entities) => {
      const loadedIds = entities.map((e) => this.selectId(e));
      const previousIds = this.queryToLoadedIds.get(sortedQueryString) || [];
      this.removeEntitiesThatAreNoLongerLoadedForSameQuery(
        previousIds,
        loadedIds,
      );

      this.onGetWithQuerySucceeded(sortedQueryString, loadedIds);

      result.next(entities);
    });

    return result.pipe(shareReplay(1));
  }

  private removeEntitiesThatAreNoLongerLoadedForSameQuery(
    previousIds: (string | number)[],
    loadedIds: (string | number)[],
  ) {
    if (!previousIds?.length) {
      return;
    }
    const removedIds = previousIds.filter((id) => !loadedIds.includes(id));
    removedIds.forEach((id) => this.removeOneFromCache(id));
  }

  private onGetWithQuerySucceeded(
    sortedQueryString: string,
    loadedIds: (string | number)[],
  ) {
    this.queryToLoadedIds.set(sortedQueryString, loadedIds);

    const loadedSubject = this.getOrCreateLoadedStateSubject(sortedQueryString);
    if (!loadedSubject.value) {
      loadedSubject.next(true);
    }
  }
}
