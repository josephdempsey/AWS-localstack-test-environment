import { AWSError, SQS } from 'aws-sdk';
import { config } from 'dotenv';
import { QueueName } from '../config';

config();

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_KEY || '',
 }
 
const createQueueParams: SQS.CreateQueueRequest = {
    QueueName,
    Attributes: {
        'FifoQueue': 'true'
    }
};

const sqs = new SQS({
    credentials,
    region:'us-east-1',
    endpoint: 'http://localhost:4576'
 });

const handleError = (err: AWSError) => console.error(err);

const insertMessagesIntoQueue = async({ QueueUrl }: SQS.CreateQueueResult, sendBatchMessageParams: SQS.SendMessageBatchRequest) => {
    if (!QueueUrl) {
        return;
    }

    console.log('QueueUrl: ', QueueUrl);

    try {
        sendBatchMessageParams.QueueUrl = QueueUrl;
        const { Successful }: SQS.SendMessageBatchResult = await sqs.sendMessageBatch(sendBatchMessageParams).promise();
        
        console.log('Success:', Successful);

        return QueueUrl;
    } catch(err) {
        handleError(err)
    }
};

const insertMessageIntoFifoQueue = async(params: SQS.SendMessageBatchRequest) => {
    try {
        const data: SQS.CreateQueueResult = await sqs.createQueue(createQueueParams).promise();

        const QueueUrl = await insertMessagesIntoQueue(data, params)

        return QueueUrl;
    } catch(err) {
        handleError(err)
    }
};

export = { insertMessageIntoFifoQueue };
