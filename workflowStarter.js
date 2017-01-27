const AWS = require('aws-sdk'),
      uuid = require('node-uuid'),
      config = require('./config.js'),
      Hapi = require('hapi'),
      server = new Hapi.Server();

server.connection(config.app.connection);
AWS.config.update(config.aws);

const swf = new AWS.SWF();

function scheduleWork(input, callback) {
  let params = {
    domain: config.swf.domain,
    workflowId: uuid.v4(),
    input: input,
    executionStartToCloseTimeout: '90',
    workflowType: {
      name: 'HelloWorkflow',
      version: config.swf.version
    }
  };

  swf.startWorkflowExecution(params, (err, data) => {
    if (err) {
      console.log(err, err.stack);
      callback(err);
    } else {
      console.log(data);
      callback(null, data);
    }
  });
}

server.route({
  method: 'GET',
  path: '/',
  handler: (req, res) => {
    return res('aws-swf-sample demo');
  }
});

server.route({
  method: 'GET',
  path: '/change/{changeString}',
  handler: (req, res) => {
    scheduleWork(req.params.changeString, (err, data) => {
      if (err) return res(err);
      else return res(data);
    });
  }
});

server.start((err) => {
  if (err) throw err;
  console.log('Server running at:', server.info.uri);
});
