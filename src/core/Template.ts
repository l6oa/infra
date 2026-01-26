import Bottleneck from 'bottleneck';
import ejs from 'ejs';
import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'node:path';

import { Execution } from '@/core/Execution';
import { WorkingFolder } from '@/core/WorkingFolder';
import { templateModules } from '@/templateModules';

export class Template {
  folder: WorkingFolder;
  type: string;
  execution: Execution;
  module: any;
  defaultConfig: Record<string, any>;
  terraformVariables: Record<string, any> | null;

  constructor(type: string, execution: Execution) {
    const location = path.join(import.meta.dirname, '../templateFiles', type);
    this.folder = new WorkingFolder(location);
    this.type = type;
    this.execution = execution;
    this.module = null;
    this.defaultConfig = {};
    this.terraformVariables = null;
  }

  async skip() {
    return this.callModule('skip') ?? false;
  }

  async loadModule() {
    this.module = (templateModules as Record<string, any>)[this.type] ?? {};
  }

  callModule(methodName: string) {
    return this.module?.[methodName]?.apply(this.execution) ?? null;
  }

  async loadDefaultConfig() {
    const templateDefaultConfig = (await this.callModule('getDefaultConfig')) ?? {};

    this.defaultConfig = {
      ...templateDefaultConfig,
      tfstatesBucketRegion: process.env.INFRA_TFSTATES_BUCKET_REGION,
      tfstatesBucketName: process.env.INFRA_TFSTATES_BUCKET_NAME,
    };
  }

  async loadTerraformVariables() {
    this.terraformVariables = (await this.callModule('getTerraformVariables')) ?? {};
  }

  async generateFiles() {
    const filesFolder = this.folder.location;
    const { outputFolder, config } = this.execution;

    const sourcePaths = await glob('**/*', {
      cwd: filesFolder,
      nodir: true,
      dot: true,
    });

    const limiter = new Bottleneck({ maxConcurrent: 1 });
    const generateFile = limiter.wrap(async (sourcePath: string) => {
      const absoluteSourcePath = path.join(filesFolder, sourcePath);
      const isDynamicFile = sourcePath.endsWith('.ejs');

      if (isDynamicFile) {
        const generatedFileContent = await ejs.renderFile(absoluteSourcePath, config);
        const outputPath = sourcePath.slice(0, -4);
        const absoluteOutputPath = outputFolder!.resolve(outputPath);
        await fs.mkdir(path.dirname(absoluteOutputPath), { recursive: true });
        await fs.writeFile(absoluteOutputPath, generatedFileContent);
      } else {
        const absoluteOutputPath = outputFolder!.resolve(sourcePath);
        await fs.mkdir(path.dirname(absoluteOutputPath), { recursive: true });
        await fs.copyFile(absoluteSourcePath, absoluteOutputPath);
      }
    });

    await Promise.all(sourcePaths.map(generateFile));

    await fs.copyFile(
      path.join(import.meta.dirname, '../templateFiles', `aws-provider.${config.local ? 'local' : 'cloud'}.tf`),
      outputFolder!.resolve('infra/aws-provider.tf'),
    );

    await this.callModule('postGenerate');
  }
}
