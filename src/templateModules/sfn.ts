import { pick } from 'lodash-es';
import fs from 'node:fs';
import path from 'node:path';

import { TemplateType } from '@/core/TemplateType';

export default {
  getTerraformVariables() {
    const variableNames = [
      'project',
      'name',
      'environment',
    ];

    return pick(this.config, variableNames);
  },
  async postGenerate() {
    const addRetries = (node: any) => {
      if (
        node.Type === 'Task'
        && typeof node.Resource === 'string'
        && node.Resource.includes('lambda')
      ) {
        node.Retry = node.Retry ?? [];
        node.Retry.push({
          ErrorEquals: ['CodeArtifactUserPendingException'],
          IntervalSeconds: 10,
          MaxAttempts: 30,
        });
        node.Retry.push({
          ErrorEquals: ['Lambda.TooManyRequestsException'],
          IntervalSeconds: 10,
          MaxAttempts: 180,
        });
      }

      for (const key in node) {
        if (typeof node[key] === 'object' && node[key] !== null) {
          addRetries(node[key]);
        }
      }
    };

    const workflowPath = path.join(this.outputFolder!.location, 'workflow.asl.json');
    const workflow = JSON.parse(await fs.promises.readFile(workflowPath, 'utf8'));
    addRetries(workflow);
    await fs.promises.writeFile(workflowPath, JSON.stringify(workflow, null, 2));
  },
} satisfies TemplateType;
