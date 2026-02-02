import { pick } from 'lodash-es';

import { TemplateType } from '@/core/TemplateType';

export default {
  skip() {
    return this.config.local;
  },
  getDefaultConfig() {
    return {
      parameters: {},
    };
  },
  async getTerraformVariables() {
    const variableNames = [
      'project',
      'name',
      'environment',
      'vpcId',
      'vpcBlock',
      'instanceType',
      'storage',
      'databaseName',
      'username',
      'password',
    ];

    return pick(this.config, variableNames);
  },
} satisfies TemplateType;
