import { BaseCommand, Step } from '@/commands/BaseCommand';
import { GlobalTasks } from '@/commands/GlobalTasks';

export class DeleteCommand extends BaseCommand {
  listSteps() {
    return [
      ...super.listSteps(),
      ['Terraform init', () => (
        GlobalTasks.runSequentially('commands.tfInit', () => (
          this.execution.terraform.init()
        ))
      )],
      ['Terraform destroy', () => this.execution.terraform.destroy()],
    ] as Step[];
  }
}
