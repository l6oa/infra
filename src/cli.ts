import { program } from 'commander';

import { CommandRunner } from '@/commands/CommandRunner';
import { DebugCommand } from '@/commands/DebugCommand';
import { DeleteCommand } from '@/commands/DeleteCommand';
import { DeployCommand } from '@/commands/DeployCommand';

import packageData from '../package.json';

function getCwd() {
  return process.env.DEPLOY_CWD ?? process.cwd();
}

const environmentArgument = ['<environment>', 'Environment name'] as const;
const localOption = ['--local', 'Configure for LocalStack'] as const;
const resourceNameOption = ['--resource-name <name>', 'Only apply to specified resource'] as const;
const workspacesOption = ['--workspaces', 'Apply to all workspaces in the current project'] as const;

program
  .name('infra')
  .description('Deploy template-based cloud infrastructures')
  .version(packageData.version);

program.command('dev')
  .summary('Deploy locally for development')
  .description([
    'Deploy locally for development',
    'Alias for: infra deploy development --local --workspaces',
  ].join('\n'))
  .option(...resourceNameOption)
  .helpOption(false)
  .action(async (options) => {
    await CommandRunner.generateRun({
      command: DeployCommand,
      cwdFolder: getCwd(),
      environment: 'development',
      local: true,
      workspaces: 'auto',
      ...options,
    });
  });

program.command('deploy')
  .description('Deploy the infrastructure')
  .argument(...environmentArgument)
  .option(...localOption)
  .option(...resourceNameOption)
  .option(...workspacesOption)
  .helpOption(false)
  .action(async (environment, options) => {
    await CommandRunner.generateRun({
      command: DeployCommand,
      cwdFolder: getCwd(),
      environment,
      ...options,
    });
  });

program.command('delete')
  .description('Delete the infrastructure')
  .argument(...environmentArgument)
  .option(...localOption)
  .option(...resourceNameOption)
  .option(...workspacesOption)
  .helpOption(false)
  .action(async (environment, options) => {
    await CommandRunner.generateRun({
      command: DeleteCommand,
      cwdFolder: getCwd(),
      environment,
      ...options,
    });
  });

program.command('debug')
  .description('Debug the produced output')
  .argument(...environmentArgument)
  .requiredOption(...resourceNameOption)
  .option(...localOption)
  .helpOption(false)
  .action(async (environment, options) => {
    await CommandRunner.generateRun({
      command: DebugCommand,
      cwdFolder: getCwd(),
      environment,
      persistent: false,
      workspaces: 'auto',
      ...options,
    });
  });

program.parseAsync();
