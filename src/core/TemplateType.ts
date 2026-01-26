import { Execution } from '@/core/Execution';

export type TemplateType = {
  skip?: (this: Execution) => Awaited<boolean>;
  getDefaultConfig?: (this: Execution) => Awaited<Record<string, any>>;
  getTerraformVariables?: (this: Execution) => Awaited<Record<string, any>>;
  postGenerate?: (this: Execution) => Awaited<void>;
  preProcess?: (this: Execution) => Awaited<void>;
};
