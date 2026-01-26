import { isNil, omitBy } from 'lodash-es';

import { OutputFolder } from '@/core/OutputFolder';
import { Template } from '@/core/Template';
import { Terraform } from '@/core/Terraform';
import { WorkingFolder } from '@/core/WorkingFolder';

export type ExecutionParams = {
  environment: string;
  local?: boolean;
  persistent?: boolean;
  sourceFolder: string;
  userConfig: {
    type: string;
    name: string;
    [key: string]: any;
  };
};

export class Execution {
  environment: string;
  local: boolean;
  persistent: boolean;
  userConfig: {
    type: string;
    name: string;
    [key: string]: any;
  };

  qualifiedName: string;
  template: Template | null = null;
  terraform: Terraform;
  sourceFolder: WorkingFolder;
  outputFolder: WorkingFolder | null = null;

  constructor(params: ExecutionParams) {
    this.environment = params.environment;
    this.local = params.local ?? false;
    this.persistent = params.persistent ?? true;

    this.userConfig = params.userConfig;
    this.qualifiedName = [
      this.userConfig.type,
      this.userConfig.name,
      this.environment,
    ].join('.');

    this.template = null;
    this.terraform = new Terraform(this);
    this.sourceFolder = new WorkingFolder(params.sourceFolder);
    this.outputFolder = null;
  }

  get config() {
    return omitBy({
      ...this.template?.defaultConfig,
      ...this.userConfig,
      local: this.local,
      environment: this.environment,
    }, isNil) as Record<string, any>;
  }

  async createOutputFolder() {
    this.outputFolder = await OutputFolder.create(this.qualifiedName, this.persistent);
  }

  async loadTemplate() {
    this.template = new Template(this.userConfig.type, this);
    await this.template.loadModule();
    await this.template.loadDefaultConfig();
  }

  async importSource() {
    await this.sourceFolder.copy('.', this.outputFolder!.toString());
  }
}
