const AWS = require('aws-sdk'),
      uuid = require('node-uuid'),
      config = require('./config.js');

AWS.config.update(config.aws);

const swf = new AWS.SWF(),
      ses = new AWS.SES(),
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
    else {
      console.log('respondActivityTaskCompleted', data);
      sendEmail('vvyas@zulily.com', ['vvyas@zulily.com'], 'Payment Notification email', 'Email sent', (err, emailData) => {
        if (err) console.log(err, err.stack);
        else console.log('Email sent:', emailData);
      });
    }
  });
}

function sendEmail(from, to, subject, body, callback) {
  let emailReq = {
    Destination: {
      ToAddresses: to
    },
    Message: {
      Subject: {
        Data: subject
      },
      Body: {
        Text: {
          Data: body
        }
      }
    },
    Source: 'vvyas@zulily.com'
  };
  ses.sendEmail(emailReq, callback);
}
