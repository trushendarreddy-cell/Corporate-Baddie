// ============================================================================
// WORKSPACE REPOSITORY
// Client-side persistence for workspace, datasets, and data sources
// ============================================================================

import { Workspace, Dataset, WSDataSource, DatasetRelationship, Investigation } from '../models/workspace';

// Storage keys
const WORKSPACE_KEY = 'cb_workspace';
const DATASETS_KEY = 'cb_datasets';
const DATA_SOURCES_KEY = 'cb_dataSources';
const RELATIONSHIPS_KEY = 'cb_relationships';
const INVESTIGATIONS_KEY = 'cb_investigations';

// ============================================================================
// DATA TYPES
// ============================================================================

export interface UserState {
  currentWorkspaceId: string | null;
  hasCreatedWorkspace: boolean;
  demoMode: boolean;
}

export const DEFAULT_USER_STATE: UserState = {
  currentWorkspaceId: null,
  hasCreatedWorkspace: false,
  demoMode: false,
};

// ============================================================================
// REPOSITORY CLASSES
// ============================================================================

export class WorkspaceRepository {
  private storageKey = WORKSPACE_KEY;

  get(): Workspace | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return null;
      return JSON.parse(stored) as Workspace;
    } catch {
      return null;
    }
  }

  save(workspace: Workspace): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(workspace));
    } catch (e) {
      console.error('Failed to save workspace:', e);
    }
  }

  remove(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore errors
    }
  }
}

export class DatasetRepository {
  private storageKey = DATASETS_KEY;

  getAll(): Dataset[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      return JSON.parse(stored) as Dataset[];
    } catch {
      return [];
    }
  }

  getById(id: string): Dataset | undefined {
    return this.getAll().find(ds => ds.id === id);
  }

  save(dataset: Dataset): void {
    const all = this.getAll();
    const existingIndex = all.findIndex(ds => ds.id === dataset.id);
    if (existingIndex >= 0) {
      all[existingIndex] = dataset;
    } else {
      all.push(dataset);
    }
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(all));
    } catch (e) {
      console.error('Failed to save dataset:', e);
    }
  }

  delete(id: string): void {
    const all = this.getAll();
    const filtered = all.filter(ds => ds.id !== id);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete dataset:', e);
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore errors
    }
  }
}

export class DataSourceRepository {
  private storageKey = DATA_SOURCES_KEY;

  getAll(): WSDataSource[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      return JSON.parse(stored) as WSDataSource[];
    } catch {
      return [];
    }
  }

  getById(id: string): WSDataSource | undefined {
    return this.getAll().find(ds => ds.id === id);
  }

  save(dataSource: WSDataSource): void {
    const all = this.getAll();
    const existingIndex = all.findIndex(ds => ds.id === dataSource.id);
    if (existingIndex >= 0) {
      all[existingIndex] = dataSource;
    } else {
      all.push(dataSource);
    }
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(all));
    } catch (e) {
      console.error('Failed to save data source:', e);
    }
  }

  delete(id: string): void {
    const all = this.getAll();
    const filtered = all.filter(ds => ds.id !== id);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete data source:', e);
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore errors
    }
  }
}

export class RelationshipRepository {
  private storageKey = RELATIONSHIPS_KEY;

  getAll(): DatasetRelationship[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      return JSON.parse(stored) as DatasetRelationship[];
    } catch {
      return [];
    }
  }

  save(relationship: DatasetRelationship): void {
    const all = this.getAll();
    const existingIndex = all.findIndex(rel => rel.id === relationship.id);
    if (existingIndex >= 0) {
      all[existingIndex] = relationship;
    } else {
      all.push(relationship);
    }
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(all));
    } catch (e) {
      console.error('Failed to save relationship:', e);
    }
  }

  delete(id: string): void {
    const all = this.getAll();
    const filtered = all.filter(rel => rel.id !== id);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete relationship:', e);
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore errors
    }
  }
}

export class InvestigationRepository {
  private storageKey = INVESTIGATIONS_KEY;

  getAll(): Investigation[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      return JSON.parse(stored) as Investigation[];
    } catch {
      return [];
    }
  }

  save(investigation: Investigation): void {
    const all = this.getAll();
    const existingIndex = all.findIndex(inv => inv.id === investigation.id);
    if (existingIndex >= 0) {
      all[existingIndex] = investigation;
    } else {
      all.unshift(investigation);
    }
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(all));
    } catch (e) {
      console.error('Failed to save investigation:', e);
    }
  }

  delete(id: string): void {
    const all = this.getAll();
    const filtered = all.filter(inv => inv.id !== id);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete investigation:', e);
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Ignore errors
    }
  }
}

// ============================================================================
// REPOSITORY FACTORY
// ============================================================================

export const workspaceRepo = new WorkspaceRepository();
export const datasetRepo = new DatasetRepository();
export const dataSourceRepo = new DataSourceRepository();
export const relationshipRepo = new RelationshipRepository();
export const investigationRepo = new InvestigationRepository();
