import fs from 'fs-extra';
import { exec } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execPromise = promisify(exec);

export class WorkingFolder {
  location: string;

  constructor(location: string) {
    this.location = location;
  }

  async execQuery(command: string) {
    const { stdout } = await execPromise(command, {
      cwd: this.location,
    });

    return stdout.trim();
  }

  async execTask(command: string) {
    const promise = execPromise(command, { cwd: this.location });
    const outputs = [] as string[];
    promise.child.stdout!.on('data', (data) => outputs.push(data));
    promise.child.stderr!.on('data', (data) => outputs.push(data));

    try {
      await promise;
    } catch {
      const error = new Error([
        'The following command failed:',
        `Command: ${command}`,
        `Directory: ${this.location}`,
      ].join('\n'));
      (error as any).log = outputs.join('');
      throw error;
    }
  }

  resolve(filePath: string) {
    return path.resolve(this.location, filePath);
  }

  async copy(from: string, to: string) {
    await fs.copy(
      this.resolve(from),
      this.resolve(to),
    );
  }

  toString() {
    return this.location;
  }
}
