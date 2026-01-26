import Bottleneck from 'bottleneck';

import { BaseCommand } from '@/commands/BaseCommand';
import { Resources } from '@/commands/Resources';
import { ExecutionParams } from '@/core/Execution';
import { CommandList } from '@/terminal/components/CommandList';
import { Renderer } from '@/terminal/Renderer';

type Command = BaseCommand & { output?: () => string };
type CommandConstructor = typeof BaseCommand;

export class CommandRunner {
  commands: Command[];
  monitor: Renderer;
  limiter: Bottleneck;

  constructor(commands: Command[]) {
    this.commands = commands;
    this.monitor = new Renderer(CommandList);
    this.limiter = new Bottleneck({ maxConcurrent: 8 });
  }

  async run() {
    const runCommand = this.limiter.wrap((command: Command) => this.runCommand(command));
    await Promise.allSettled(this.commands.map(runCommand));
    this.monitor.end();
    this.logResults();
  }

  async runCommand(command: Command) {
    if (command.aborted) {
      return;
    }

    command.on('update', () => {
      this.monitor.render({ commands: this.commands });
    });

    await command.execute().catch(() => {
      this.abortPendingCommands();
    });
  }

  abortPendingCommands() {
    this.commands.forEach((command) => {
      command.abort();
    });
  }

  logResults() {
    const commandWithError = this.commands.find((command) => (
      command.error && !command.aborted
    ));

    if (commandWithError) {
      const { error } = commandWithError;
      console.log();
      console.error(`Error on resource ${commandWithError.resourceName}`);
      console.error(error!.message);
      if ((error as any).log) {
        console.error('Check logs for details.\n');
        console.error((error as any).log);
      }
      process.exit(1);
    }

    this.commands.forEach((command) => {
      if (command.status === 'succeeded' && command.output) {
        console.log();
        console.error(`Output for resource ${command.resourceName}:`);
        command.output();
      }
    });
  }

  static async generateRun(generateParams: {
    command: CommandConstructor;
    cwdFolder: string;
    environment: string;
    resourceName?: string;
    workspaces?: boolean;
  } & Omit<ExecutionParams, 'sourceFolder' | 'userConfig'>) {
    const {
      command,
      cwdFolder,
      environment,
      resourceName,
      workspaces = false,
      ...executionParams
    } = generateParams;

    const resources = await Resources.listResources({
      cwdFolder,
      environment,
      workspaces,
    });

    const filteredResources = resources.filter((resource) => (
      !resourceName || `${resource.userConfig.type}.${resource.userConfig.name}` === resourceName
    ));

    const commands = filteredResources.map((resource) => new command({
      sourceFolder: resource.sourceFolder,
      userConfig: resource.userConfig,
      environment,
      ...executionParams,
    }));

    const runner = new CommandRunner(commands);
    await runner.run();
  }
}
