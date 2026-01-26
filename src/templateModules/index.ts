import ebs from '@/templateModules/ebs';
import ecs from '@/templateModules/ecs';
import efs from '@/templateModules/efs';
import lambda from '@/templateModules/lambda';
import parameters from '@/templateModules/parameters';
import rds from '@/templateModules/rds';
import s3 from '@/templateModules/s3';
import sfn from '@/templateModules/sfn';
import sfnLauncher from '@/templateModules/sfn-launcher';
import sqs from '@/templateModules/sqs';

export const templateModules = {
  ebs,
  ecs,
  efs,
  lambda,
  parameters,
  rds,
  s3,
  sfn,
  'sfn-launcher': sfnLauncher,
  sqs,
};
