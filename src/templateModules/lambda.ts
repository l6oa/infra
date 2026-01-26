import fs from 'fs-extra';
import { compact, get, pick } from 'lodash-es';
import crypto from 'node:crypto';
import path, { dirname } from 'node:path';

import { GlobalTasks } from '@/commands/GlobalTasks';
import { TemplateType } from '@/core/TemplateType';

export default {
  async getDefaultConfig() {
    const getTokenCommand = 'yarn config get npmAuthToken --no-redacted';
    const npmAuthToken = await this.sourceFolder.execQuery(getTokenCommand);

    const imageFeatures = this.config.imageFeatures ?? [];
    const imagePackages = this.config.imagePackages ?? [];
    const packagesHash = crypto
      .createHash('md5')
      .update(imagePackages.sort().join(','))
      .digest('hex');

    const localImageName = compact([
      'lambda-runtime',
      imageFeatures.includes('GraphicsMagick') && 'gm',
      imageFeatures.includes('Java') && 'java',
      imagePackages.length > 0 && packagesHash.slice(0, 6),
    ]).join('-');

    async function findPackageValue(folder: string, key: string): Promise<any> {
      const pkgPath = path.resolve(folder, 'package.json');

      if (await fs.exists(pkgPath)) {
        const packageJson = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
        const value = get(packageJson, key);
        if (value) {
          return value;
        }
      }

      const parentFolder = dirname(folder);
      return parentFolder !== folder ? findPackageValue(parentFolder, key) : null;
    }

    const nodeVersion = await findPackageValue(this.sourceFolder.location, 'engines.node') ?? '20';
    const yarnRelease = await findPackageValue(this.sourceFolder.location, 'packageManager') ?? 'yarn@4.3.1';

    return {
      npmAuthToken,
      localImageName,
      localFunctionPath: this.sourceFolder.location,
      imageVariant: 'slim',
      imageFeatures,
      imagePackages,
      include: [],
      destinations: [],
      env: {},
      nodeVersion,
      yarnRelease,
    };
  },
  getTerraformVariables() {
    const variableNames = [
      'project',
      'name',
      'environment',
      'memory',
      'storage',
      'destinations',
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
  async preProcess() {
    if (this.config.local) {
      const { localImageName } = this.config;
      const buildCommand = `docker build . --file dockerfile.local --tag ${localImageName}`;
      await GlobalTasks.runShared('templates.lambda.runtimeBuild', buildCommand, () => (
        this.outputFolder!.execTask(buildCommand)
      ));
    }
  },
} satisfies TemplateType;
