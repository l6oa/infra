import fs from 'fs-extra';
import { castArray, flatten } from 'lodash-es';
import path from 'node:path';

import { WorkingFolder } from '@/core/WorkingFolder';

type WorkspaceList = {
  name: string;
  location: string;
}[];

export class Resources {
  static async listResources(params: {
    cwdFolder: string;
    environment: string;
    workspaces?: boolean | 'auto';
  }) {
    const {
      cwdFolder,
      environment,
      workspaces = false,
    } = params;

    const sourceFolders = await this.listSourceFolders(cwdFolder, workspaces);
    const resources = flatten(await Promise.all(
      sourceFolders.map(async (sourceFolder) => {
        const folderResources = await this.listFolderResources(sourceFolder, environment);
        return folderResources.map((resource) => ({
          userConfig: resource,
          sourceFolder,
        }));
      }),
    ));

    return resources;
  }

  static async listSourceFolders(cwdFolder: string, workspaces: boolean | 'auto' = false) {
    switch (workspaces) {
      case true: return this.listWorkspaces(cwdFolder);
      case 'auto': return this.listWorkspaces(cwdFolder).catch(() => [cwdFolder]);
      default: return [cwdFolder];
    }
  }

  static async listWorkspaces(cwdFolder: string) {
    const workingFolder = new WorkingFolder(cwdFolder);
    const workspacesOutput = await workingFolder.execQuery('yarn workspaces list --json');
    const workspaces: WorkspaceList = workspacesOutput.split('\n').map((line) => JSON.parse(line));
    const rootPath = await workingFolder.execQuery(`yarn workspace ${workspaces[0].name} exec pwd`);
    return workspaces.map(({ location }) => path.join(rootPath, location));
  }

  static async listFolderResources(sourceFolder: string, environment: string) {
    const resources: any[] = [];

    const globalConfigPath = path.join(sourceFolder, 'execution.config.js');
    const globalConfigExists = await fs.pathExists(globalConfigPath);
    if (globalConfigExists) {
      const globalConfig = (await import(globalConfigPath)).default;
      resources.push(...castArray(globalConfig));
    }

    const envConfigPath = path.join(sourceFolder, `execution.${environment}.config.js`);
    const envConfigExists = await fs.pathExists(envConfigPath);
    if (envConfigExists) {
      const envConfig = (await import(envConfigPath)).default;
      resources.push(...castArray(envConfig));
    }

    return resources;
  }
}
