// This config would come from vault

const AttributeNames = ['All'];
const MaxNumberOfMessages = 2;
const QueueUrl = 'http://localhost:4576/queue/test__queue.fifo';
const VisibilityTimeout = 30;
const WaitTimeSeconds = 1;
const ReceiveRequestAttemptId = 'x';
const QueueName = 'test__queue.fifo';

export {
    AttributeNames,
    MaxNumberOfMessages,
    QueueUrl,
    ReceiveRequestAttemptId,
    VisibilityTimeout,
    WaitTimeSeconds,
    QueueName
};
