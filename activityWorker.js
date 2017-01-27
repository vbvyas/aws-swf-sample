const AWS = require('aws-sdk'),
      uuid = require('node-uuid'),
      config = require('./config.js');

AWS.config.update({
  region: process.env.AWS_REGION || 'us-west-2'
});

const swf = new AWS.SWF(),
      params = {
        domain: config.swf.domain,
        taskList: {
          name: config.swf.taskList
        }
      };

setInterval(() => {
    swf.pollForActivityTask(params, (err, task) => {
        console.log('task', task);
        if (err) console.log(err, err.stack);

        if (task && task.taskToken && task.input) {
            execute(task);
        }
    });
}, config.swf.pollingInterval);

function execute(task) {
    console.log('input', task.input);
    const result = 'Hello ' + task.input;

    swf.respondActivityTaskCompleted({
        taskToken: task.taskToken,
        result: result
    }, (err, data) => {
        if (err) console.log(err, err.stack);
        else console.log('respondActivityTaskCompleted', data);
    });
}