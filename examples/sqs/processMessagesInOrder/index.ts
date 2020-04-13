import { AWSError, SQS } from 'aws-sdk';
import { config } from 'dotenv';
import { QueueUrl } from '../config';

config();

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_KEY || '',
 }

const sqs = new SQS({
    credentials,
    region:'us-east-1',
    endpoint: 'http://localhost:4576'
 });

const handleError = (err: AWSError) => console.error(err);

const deleteMessage = async(ReceiptHandle: string) => {
    const deleteParams = {
        QueueUrl,
        ReceiptHandle
    };
    try {
        await sqs.deleteMessage(deleteParams).promise();

        console.log('Deleted message from queue.');

        return 'Processed Message & deleted message(s) from queue.';
    } catch (err) {
        return handleError(err);
    }
};

const handleAcadiaMessages = async({ Messages }: SQS.ReceiveMessageResult) => {
    if (!Messages) {
        return; // the wonders of TypeScript alert us to this possibility - no-op for now
    }

    console.log('Messages', Messages);

    return Promise.all(Messages.map(async message => {
        try {
            const { Body, MessageId, ReceiptHandle } = message;
            console.log('Message:', MessageId, Body, ReceiptHandle);

            if (ReceiptHandle) {
                return await deleteMessage(ReceiptHandle);
            }

            throw Error('No ReceiptHandle');
        } catch(error) {
            return handleError(error);
        }
     }));
};

const processMessagesInOrder = async(params: SQS.ReceiveMessageRequest) => {
    try {
        const data: SQS.ReceiveMessageResult = await sqs.receiveMessage(params).promise();

        const result = await handleAcadiaMessages(data);

        if (result && result.length) {
            return result;
        }

        return;
    } catch(err) {
        return handleError(err)
    }
};

export = { processMessagesInOrder };
