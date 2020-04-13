import { SQS } from 'aws-sdk';
import { config } from 'dotenv';
// @ts-ignore
import { insertMessageIntoFifoQueue } from '../../../../examples/sqs/insertMessageIntoFifoQueue'
// @ts-ignore
import { deleteFifoQueue } from '../../../../examples/sqs/deleteFifoQueue'
// @ts-ignore
import { processMessagesInOrder } from '../../../../examples/sqs/processMessagesInOrder';
import { AttributeNames, QueueUrl, ReceiveRequestAttemptId, WaitTimeSeconds } from '../../../../examples/sqs/config';

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

const sendBatchMessageParams: SQS.SendMessageBatchRequest = {
    QueueUrl: '',
    Entries: [{
        Id: '1',
        MessageBody: 'message 1 group 1',
        MessageDeduplicationId: 'group1_1',
        MessageGroupId: 'group1'
        },
        {
        Id: '2',
        MessageBody: 'message 1 group 2',
        MessageDeduplicationId: 'group2_1',
        MessageGroupId: 'group2'
       },
       {
        Id: '3',
        MessageBody: 'message 1 group 3',
        MessageDeduplicationId: 'group3_1',
        MessageGroupId: 'group3'
       },
       {
        Id: '4',
        MessageBody: 'message 2 group 1',
        MessageDeduplicationId: 'group1_2',
        MessageGroupId: 'group1'
       },
       {
        Id: '5',
        MessageBody: 'message 3 group 1',
        MessageDeduplicationId: 'group1_3',
        MessageGroupId: 'group1'
        },
        {
        Id: '6',
        MessageBody: 'message 4 group 1',
        MessageDeduplicationId: 'group1_4',
        MessageGroupId: 'group1'
       },
       {
        Id: '7',
        MessageBody: 'message 2 group 2',
        MessageDeduplicationId: 'group2_2',
        MessageGroupId: 'group2'
       },
       {
        Id: '8',
        MessageBody: 'message 2 group 3',
        MessageDeduplicationId: 'group3_2',
        MessageGroupId: 'group3'
       },
       {
        Id: '9',
        MessageBody: 'message 3 group 3',
        MessageDeduplicationId: 'group3_3',
        MessageGroupId: 'group3'
       }]
};

const setup = async() => {
    jest.setTimeout(60000);
    await insertMessageIntoFifoQueue(sendBatchMessageParams)
}

const tearDown = async() => {
    await deleteFifoQueue()
}

const wait = async (ms: number) => {
    return new Promise(resolve => {
        console.log(`wait ${ms} secs`);
        setTimeout(resolve, ms);
    });
  }


describe('FIFO process messages in order', () => {
    describe('Mulitple consumers, limited to processing one message at a time', () => {
        test('gets message for group1 off queue and waits unitl this is processed before releasing the next message for group 1', async () => {
            try {
                await setup();

                const params: SQS.ReceiveMessageRequest = {
                    QueueUrl,
                    AttributeNames,
                    MaxNumberOfMessages: 1,
                    MessageAttributeNames: ['All'],
                    VisibilityTimeout: 10,
                    WaitTimeSeconds
                };
                
                const data1: SQS.ReceiveMessageResult = await sqs.receiveMessage(params).promise();
                console.log('message group after 1st receiveMessage call: ', data1!.Messages![0]!.Attributes!.MessageGroupId);

                await wait(5000);  

                const data2: SQS.ReceiveMessageResult = await sqs.receiveMessage(params).promise();

                console.log('message group after 2rd receiveMessage call with 5 secs delay: ', data2!.Messages![0]!.Attributes!.MessageGroupId);

                expect(data1!.Messages![0]!.Attributes!.MessageGroupId).not.toBe(data2!.Messages![0]!.Attributes!.MessageGroupId)

                await wait(10000);  

                const processedMessage = await processMessagesInOrder(params);
                
                if(!processedMessage) {
                    throw new Error('No messages processed');
                }

                console.log('3rd receiveMessage call via processedMessage function:', processedMessage);

                expect(processedMessage[0]).toBe('Processed Message & deleted message(s) from queue.')

                const data3: SQS.ReceiveMessageResult = await sqs.receiveMessage(params).promise();

                console.log('message group after 4rd receiveMessage call:', data3!.Messages![0]!.Attributes!.MessageGroupId);

                expect(data1!.Messages![0]!.Attributes!.MessageGroupId).toBe(data3!.Messages![0]!.Attributes!.MessageGroupId)
            } catch(err) {
                await tearDown();

                throw err
            }

            await tearDown();
        })
    })
})