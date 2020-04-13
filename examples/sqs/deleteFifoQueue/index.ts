import { AWSError, SQS } from 'aws-sdk';
import { config } from 'dotenv';
import { QueueUrl } from '../config';

config();

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_KEY || '',
 }
 
const deleteQueueParams: SQS.DeleteQueueRequest = {
    QueueUrl
};

const sqs = new SQS({
    credentials,
    region:'us-east-1',
    endpoint: 'http://localhost:4576'
 });

const handleError = (err: AWSError) => console.error(err);

const deleteFifoQueue = async() => {
    try {
        await sqs.deleteQueue(deleteQueueParams).promise();

        console.log('Queue Deleted')
    } catch(err) {
        handleError(err)
    }
};

export = { deleteFifoQueue };
