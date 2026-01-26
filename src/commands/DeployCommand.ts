import { BaseCommand, Step } from '@/commands/BaseCommand';
import { GlobalTasks } from '@/commands/GlobalTasks';

export class DeployCommand extends BaseCommand {
  listSteps() {
    return [
      ...super.listSteps(),
      ['Template preprocess', () => this.execution.template!.callModule('preProcess')],
      ['Terraform init', () => (
        GlobalTasks.runSequentially('commands.tfInit', () => (
          this.execution.terraform.init()
        ))
      )],
      ['Terraform apply', () => this.execution.terraform.apply()],
    ] as Step[];
  }
}
