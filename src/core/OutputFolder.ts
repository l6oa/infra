import { mkdirs } from 'fs-extra';
import { homedir } from 'node:os';
import path from 'node:path';
import { rimraf } from 'rimraf';
import tmp from 'tmp-promise';

import { WorkingFolder } from '@/core/WorkingFolder';

export class OutputFolder {
  static async create(qualifiedName: string, persistent: boolean) {
    return persistent
      ? this.createPersistent(qualifiedName)
      : this.createTemporary(qualifiedName);
  }

  static async createPersistent(qualifiedName: string) {
    const outputPath = path.join(homedir(), '.execution', qualifiedName);
    await mkdirs(outputPath);
    await rimraf(path.join(outputPath, '**/*'), {
      filter: (filePath) => (
        !filePath.includes('.terraform')
        && !filePath.endsWith('terraform.tfstate')
      ),
      glob: { dot: true },
    });
    return new WorkingFolder(outputPath);
  }

  static async createTemporary(qualifiedName: string) {
    const tmpResource = await tmp.dir({ prefix: qualifiedName });
    return new WorkingFolder(tmpResource.path);
  }
}
