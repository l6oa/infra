import { pick } from 'lodash-es';

import { TemplateType } from '@/core/TemplateType';

export default {
  getDefaultConfig() {
    return {
      autoCleanup: false,
      rawName: null,
      public: false,
      corsOrigins: [],
    };
  },
  getTerraformVariables() {
    const variableNames = [
      'project',
      'name',
      'environment',
    ];

    return pick(this.config, variableNames);
  },
} satisfies TemplateType;
