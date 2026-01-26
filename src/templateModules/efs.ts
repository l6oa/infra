import { pick } from 'lodash-es';

import { TemplateType } from '@/core/TemplateType';

export default {
  skip() {
    return this.config.local;
  },
  async getTerraformVariables() {
    const variableNames = [
      'project',
      'name',
      'environment',
      'subnetId',
      'directoryPath',
      'userUid',
      'userGid',
    ];

    return pick(this.config, variableNames);
  },
} satisfies TemplateType;
