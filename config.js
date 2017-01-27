const config = {};

config.aws = {
  region: process.env.AWS_REGION || 'us-west-2'
};

config.swf = {
  domain: 'HelloDomain',
  taskList: 'HelloTasklist',
  workflow: 'HelloWorkflow',
  activity: 'HelloActivity',
  version: '1.0',
  pollingInterval: 5000
};

config.app = {
  connection: {
    host: 'localhost',
    port: 8888
  }
};

module.exports = config;
