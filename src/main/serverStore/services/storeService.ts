import { CONFIG_SCHEMA } from '../config';
import { AppConfig } from '../types';

class StoreService {
  private static instance: StoreService;
  private store: any = null;

  private constructor() {}

  public static getInstance(): StoreService {
    if (!StoreService.instance) {
      StoreService.instance = new StoreService();
    }
    return StoreService.instance;
  }

  public async getStore() {
    if (!this.store) {
      const { default: Store } = await import('electron-store');
      this.store = new Store<AppConfig>({ schema: CONFIG_SCHEMA });
    }
    return this.store;
  }

  public async get<K extends keyof AppConfig>(key: K): Promise<AppConfig[K]> {
    const store = await this.getStore();
    return store.get(key);
  }

  public async set<K extends keyof AppConfig>(
    key: K,
    value: AppConfig[K],
  ): Promise<void> {
    const store = await this.getStore();
    store.set(key, value);
  }

  public async update<K extends keyof AppConfig>(
    key: K,
    updater: (current: AppConfig[K]) => AppConfig[K],
  ): Promise<void> {
    const store = await this.getStore();
    const current = store.get(key);
    const updated = updater(current);
    store.set(key, updated);
  }
}

export const storeService = StoreService.getInstance();
