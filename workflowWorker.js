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
  swf.pollForDecisionTask(params, (err, task) => {
    if (err) console.log(err, err.stack);

    if (task && task.taskToken && task.events && task.events.length) {
      executeDecisionTask(task);
    }
  });
}, config.swf.pollingInterval);

function executeDecisionTask(task) {
  let activityCompleted = false,
    workflowInput,
    openActivities = 0,
    scheduledActivities = 0,
    result,
    decision,
    decisions = [];

  task.events.forEach((event) => {
    console.log('event', event.eventType);
    switch (event.eventType) {
      case 'WorkflowExecutionStarted':
        workflowInput = event.workflowExecutionStartedEventAttributes;
        console.log('workflowInput', workflowInput);
        break;
      case 'ActivityTaskScheduled':
        scheduledActivities++;
        break;
      case 'ScheduleActivityTaskFailed':
        scheduledActivities--;
        break;
      case 'ActivityTaskStarted':
        scheduledActivities--;
        openActivities++;
        break;
      case 'ActivityTaskCompleted':
        openActivities++;
        activityCompleted = true;
        result = event.activityTaskCompletedEventAttributes.result;
        console.log('result', result);
        break;
      case 'ActivityTaskFailed':
        openActivities--;
        break;
      case 'ActivityTaskTimedOut':
        openActivities--;
        break;
    }
  });

  if (activityCompleted) {
    console.log('activityCompleted');
    decision = {
      decisionType: 'CompleteWorkflowExecution',
      completeWorkflowExecutionDecisionAttributes: {
        result: result
      }
    };
    decisions.push(decision);
  } else {
    console.log('openActivities', openActivities, 'scheduledActivities', scheduledActivities);
    if (openActivities == 0 && scheduledActivities == 0) {
      decision = {
        decisionType: 'ScheduleActivityTask',
        scheduleActivityTaskDecisionAttributes: {
          activityType: {
            name: config.swf.activity,
            version: config.swf.version
          },
          activityId: uuid.v4(),
          input: workflowInput.input
        }
      };
      decisions.push(decision);
    }
  }

  console.log('decisions', decisions);

  swf.respondDecisionTaskCompleted({
    taskToken: task.taskToken,
    decisions: decisions
  }, (err, data) => {
    if (err) console.log(err, err.stack);
    else console.log('respondDecisionTaskCompleted', data);
  });
}
