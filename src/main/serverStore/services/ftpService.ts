import { DEFAULT_FTP_CONFIG } from '../config';
import { storeService } from './storeService';
import { FtpConfig } from '../types';

export class FtpConfigService {
  async getFtpConfig(): Promise<FtpConfig> {
    // return DEFAULT_FTP_CONFIG;
    return (await storeService.get('ftpConfig')) || DEFAULT_FTP_CONFIG;
  }

  async setFtpConfig(config: FtpConfig): Promise<void> {
    await storeService.set('ftpConfig', config);
  }

  async updateFtpConfig(updates: Partial<FtpConfig>): Promise<FtpConfig> {
    const currentConfig = await this.getFtpConfig();
    const updatedConfig = { ...currentConfig, ...updates };
    await storeService.set('ftpConfig', updatedConfig);
    return updatedConfig;
  }

  async resetFtpConfig(): Promise<void> {
    await storeService.set('ftpConfig', DEFAULT_FTP_CONFIG);
  }

  async validateConfig(config: Partial<FtpConfig>): Promise<string[]> {
    const errors: string[] = [];

    if (config.port && (config.port < 1 || config.port > 65535)) {
      errors.push('Port must be between 1 and 65535');
    }

    if (config.pasvMin && config.pasvMax && config.pasvMin >= config.pasvMax) {
      errors.push('Passive minimum port must be less than maximum port');
    }

    return errors;
  }
}

export const ftpConfigService = new FtpConfigService();
