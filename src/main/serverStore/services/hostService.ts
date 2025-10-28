import { HostEntry } from '../types';
import { storeService } from './storeService';

export class HostService {
  async getHosts(): Promise<HostEntry[]> {
    return (await storeService.get('hosts')) || [];
  }

  async addHost(hostEntry: HostEntry): Promise<void> {
    await storeService.update('hosts', (currentHosts) => [
      ...currentHosts,
      hostEntry,
    ]);
  }

  async removeHost(id: string): Promise<boolean> {
    const currentHosts = await this.getHosts();
    const initialLength = currentHosts.length;

    await storeService.update('hosts', (hosts) =>
      hosts.filter((host) => host.id !== id),
    );

    const updatedHosts = await this.getHosts();
    const wasRemoved = updatedHosts.length < initialLength;

    if (!wasRemoved) {
      console.warn(`Host with id "${id}" not found`);
    }

    return wasRemoved;
  }

  async updateHost(hostEntry: HostEntry): Promise<void> {
    await storeService.update('hosts', (currentHosts) =>
      currentHosts.map((host) => (host.id === hostEntry.id ? hostEntry : host)),
    );
  }

  async removeAllHosts(): Promise<void> {
    await storeService.set('hosts', []);
  }

  async getSelectedHost(): Promise<string> {
    return (await storeService.get('selectedHost')) || '';
  }

  async setSelectedHost(hostId: string): Promise<void> {
    await storeService.set('selectedHost', hostId);
  }
}

export const hostService = new HostService();
