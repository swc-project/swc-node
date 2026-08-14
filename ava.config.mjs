const loader = process.env.SWC_NODE_ESM_LOADER ?? '@swc-node/register/esm-register'

export default {
  extensions: ['js', 'ts', 'tsx'],
  nodeArguments: [`--import=${loader}`],
  cache: false,
  files: ['packages/**/*.spec.{js,ts,tsx}'],
  environmentVariables: {
    SWC_NODE_PROJECT: './tsconfig.test.json',
  },
}
