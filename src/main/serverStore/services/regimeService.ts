import { storeService } from './storeService';

export class RegimeService {
  async getRegime(): Promise<number[]> {
    return (await storeService.get('regime')) || [];
  }

  async addRegime(value: number): Promise<void> {
    await storeService.update('regime', (currentRegime) => {
      if (!currentRegime.includes(value)) {
        return [...currentRegime, value];
      }
      return currentRegime;
    });
  }

  async removeRegime(value: number): Promise<void> {
    await storeService.update('regime', (currentRegime) =>
      currentRegime.filter((v) => v !== value),
    );
  }

  async clearRegime(): Promise<void> {
    await storeService.set('regime', []);
  }
}

export const regimeService = new RegimeService();
