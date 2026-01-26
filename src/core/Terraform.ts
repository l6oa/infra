import fs from 'fs-extra';
import { mapKeys, snakeCase } from 'lodash-es';

import { Execution } from '@/core/Execution';

export class Terraform {
  execution: Execution;

  constructor(execution: Execution) {
    this.execution = execution;
  }

  async generateVariableFile() {
    const filePath = this.execution.outputFolder!.resolve('infra/.auto.tfvars.json');
    const variables = this.execution.template!.terraformVariables;
    const snakeCaseVariables = mapKeys(variables, (value, key) => snakeCase(key));
    const variablesJson = JSON.stringify(snakeCaseVariables, null, 2);
    await fs.writeFile(filePath, variablesJson);
  }

  async exec(args: string) {
    await this.execution.outputFolder!.execTask(`terraform -chdir=infra ${args} -input=false`);
  }

  async init() {
    await this.exec('init');
  }

  async apply() {
    await this.exec('apply -auto-approve');
  }

  async destroy() {
    await this.exec('destroy -auto-approve');
  }
}
