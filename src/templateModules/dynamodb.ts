import { pick } from 'lodash-es';

import { TemplateType } from '@/core/TemplateType';

export default {
  getTerraformVariables() {
    const variableNames = [
      'project',
      'name',
      'environment',
      'hashKey',
    ];

    return pick(this.config, variableNames);
  },
} satisfies TemplateType;
