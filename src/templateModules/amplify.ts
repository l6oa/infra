import { pick } from 'lodash-es';

import { TemplateType } from '@/core/TemplateType';

export default {
  getTerraformVariables() {
    const variableNames = [
      'project',
      'name',
      'environment',
      'domain',
      'subdomain',
      'certificateArn',
      'buildBucketRawName',
    ];

    return {
      ...pick(this.config, variableNames),
      buildPath: this.sourceFolder.resolve(this.config.buildPath),
    };
  },
} satisfies TemplateType;
