import { BaseCommand } from '@/commands/BaseCommand';

export class DebugCommand extends BaseCommand {
  output() {
    const outputPath = this.execution.outputFolder!.toString();
    console.log(`Output path: ${outputPath}`);
  }
}
