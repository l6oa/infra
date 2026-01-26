import Bottleneck from 'bottleneck';
import { find } from 'lodash-es';

export class GlobalTasks {
  static sharedTasks: {
    taskName: string;
    params: any;
    promise: Promise<void>;
  }[] = [];

  static sequentialTasks: Map<string, Bottleneck> = new Map();

  static async runShared(taskName: string, params: any, process: () => any) {
    const existingTask = find(this.sharedTasks, { taskName, params });
    if (existingTask) {
      return existingTask.promise;
    }

    const promise = Promise.resolve().then(process);
    const newTask = { taskName, params, promise };

    this.sharedTasks.push(newTask);
    return promise;
  }

  static async runSequentially(taskName: string, process: () => any) {
    if (!this.sequentialTasks.has(taskName)) {
      const newLimiter = new Bottleneck({ maxConcurrent: 1 });
      this.sequentialTasks.set(taskName, newLimiter);
    }

    const limiter = this.sequentialTasks.get(taskName);
    await limiter!.schedule(process);
  }
}
