const AWS = require('aws-sdk'),
    config = require('./config.js');

AWS.config.update(config.aws);

const swf = new AWS.SWF();

// run once only or use the console to do this
swf.registerDomain({
  name: config.swf.domain,
  description: '',
  workflowExecutionRetentionPeriodInDays: '1'
}, (err, data) => {
  if (err) console.log(err, err.stack);
  else console.log(data);
  swf.registerWorkflowType({
    domain: config.swf.domain,
    name: config.swf.workflow,
    version: config.swf.version
  }, (err, data) => {
    if (err) console.log(err, err.stack);
    else console.log(data);
    swf.registerActivityType({
      domain: config.swf.domain,
      name: config.swf.activity,
      version: config.swf.version
    }, (err, data) => {
      if (err) console.log(err, err.stack);
      else console.log(data);
      console.log('done');
    })
  })
});
