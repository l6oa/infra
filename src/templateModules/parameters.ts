import { pick } from 'lodash-es';

import { TemplateType } from '@/core/TemplateType';

export default {
  async getTerraformVariables() {
    const variableNames = [
      'project',
      'name',
      'environment',
      'values',
    ];

    return pick(this.config, variableNames);
  },
} satisfies TemplateType;
