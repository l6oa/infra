import path from 'node:path';

export async function handler(...args) {
  const functionModulePath = path.join(process.env.FUNCTION_PATH, 'dist/index.js');
  const functionModule = await import(functionModulePath);
  return functionModule.handler(...args);
}
