import { pick } from 'lodash-es';
import path from 'node:path';

import { TemplateType } from '@/core/TemplateType';

export default {
  skip() {
    return this.config.local;
  },
  async getTerraformVariables() {
    const variableNames = [
      'project',
      'name',
      'environment',
      'vpc',
      'vpcBlock',
      'cpu',
      'memory',
      'environmentVariables',
      'certificateArn',
    ];

    return pick(this.config, variableNames);
  },
  async postGenerate() {
    if (this.config.local) {
      return;
    }

    const importYarnCache = async () => {
      const cacheFolder = await this.sourceFolder.execQuery('yarn config get cacheFolder');
      await this.outputFolder!.copy(cacheFolder, '.yarn/cache');
    };

    const importYarnLock = async () => {
      const cacheFolder = await this.sourceFolder.execQuery('yarn config get cacheFolder');
      const lockPath = path.join(cacheFolder, '../../yarn.lock');
      await this.outputFolder!.copy(lockPath, 'yarn.lock');
    };

    await importYarnCache();
    await importYarnLock();
  },
} satisfies TemplateType;
