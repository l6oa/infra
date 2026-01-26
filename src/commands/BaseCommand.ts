import Bottleneck from 'bottleneck';
import { EventEmitter } from 'node:events';

import { Execution, ExecutionParams } from '@/core/Execution';

export type Step = [string, () => Promise<void>];
type Status = 'inactive' | 'pending' | 'succeeded' | 'failed' | 'aborted';

export class BaseCommand extends EventEmitter {
  resourceName: string;
  execution: Execution;
  status: Status;
  aborted: boolean;
  startDate: Date | null = null;
  endDate: Date | null = null;
  stepName: string | null = null;
  error: Error | null = null;

  constructor(params: ExecutionParams) {
    super();
    this.resourceName = `${params.userConfig.type}.${params.userConfig.name}`;
    this.execution = new Execution(params);
    this.status = 'inactive';
    this.aborted = false;
  }

  async execute() {
    if (this.aborted) {
      return;
    }

    this.startDate = new Date();

    const limiter = new Bottleneck({ maxConcurrent: 1 });
    const executeStep = limiter.wrap((step: Step) => this.executeStep(step));
    const steps = this.listSteps();
    await Promise.all(steps.map((step) => executeStep(step)));
    this.end('succeeded');
  }

  async executeStep(step: Step) {
    if (this.ended) {
      throw new Error('Command already ended.');
    }

    if (this.aborted) {
      this.end('aborted');
      throw new Error('Command aborted.');
    }

    if (this.status !== 'pending') {
      this.updateStatus('pending');
    }

    const [stepName, stepProcess] = step;
    this.stepName = stepName;
    this.notifyUpdate();

    const stepPromise = Promise.resolve().then(stepProcess);
    await stepPromise.catch((error) => {
      this.end('failed');
      this.error = error;
      throw error;
    });
  }

  get ended() {
    return !!this.endDate;
  }

  end(status: Status) {
    if (this.ended) {
      return;
    }

    this.endDate = new Date();
    if (status !== 'failed') {
      this.stepName = null;
    }
    this.updateStatus(status);
  }

  updateStatus(status: Status) {
    if (this.status !== status) {
      this.status = status;
      this.notifyUpdate();
    }
  }

  notifyUpdate() {
    this.emit('update');
  }

  abort() {
    if (['inactive', 'pending'].includes(this.status)) {
      this.aborted = true;
    }
  }

  async skipIfNeeded() {
    const shouldSkip = await this.execution.template?.skip();
    if (shouldSkip) {
      this.abort();
      console.log('aborted');
    }
  }

  listSteps() {
    return [
      ['Template loading', () => this.execution.loadTemplate()],
      ['Skip check', () => this.skipIfNeeded()],
      ['Output folder creation', () => this.execution.createOutputFolder()],
      ['Source files import', () => this.execution.importSource()],
      ['Template files generation', () => this.execution.template!.generateFiles()],
      ['Terraform variables loading', () => this.execution.template!.loadTerraformVariables()],
      ['Terraform variables file generation', () => this.execution.terraform.generateVariableFile()],
    ] as Step[];
  }
}
