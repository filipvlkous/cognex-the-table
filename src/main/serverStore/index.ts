export * from './types';
export * from './config';
export { hostService } from './services/hostService';
export { regimeService } from './services/regimeService';
export { ftpConfigService } from './services/ftpService';
export { storeService } from './services/storeService';

import { FtpConfig, HostEntry } from './types';

// // utils/config.utils.ts (bonus utilities)

export const configUtils = {
  generateHostId(): string {
    return `host_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  validateHostEntry(host: Partial<HostEntry>): string[] {
    const errors: string[] = [];

    if (!host.name?.trim()) errors.push('Host name is required');
    if (!host.host?.trim()) errors.push('Host address is required');
    if (!host.port?.trim()) errors.push('Port is required');

    const portNum = parseInt(host.port || '0');
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      errors.push('Port must be a valid number between 1 and 65535');
    }

    return errors;
  },

  sanitizeFtpConfig(config: Partial<FtpConfig>): Partial<FtpConfig> {
    const sanitized = { ...config };

    if (sanitized.username) {
      sanitized.username = sanitized.username.trim();
    }
    if (sanitized.host) {
      sanitized.host = sanitized.host.trim();
    }
    if (sanitized.rootPath) {
      sanitized.rootPath = sanitized.rootPath.trim();
    }

    return sanitized;
  },
};
