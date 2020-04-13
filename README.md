# localstack
Testing aws services locally

Example of aws cli commands against localstack

S3

Create s3 bucket
- aws --endpoint-url=http://localhost:4572 s3 mb s3://demo-bucket
Add acl to s3 bucket
- aws --endpoint-url=http://localhost:4572 s3api put-bucket-acl --bucket demo-bucket --acl public-read


SQS

Create SQS FIFO queue
- aws --endpoint-url=http://localhost:4576 sqs create-queue --queue-name "test-queue.fifo" --attributes "FifoQueue=true" --region us-east-1
List SQS queues
- aws --endpoint-url=http://localhost:4576 sqs list-queues --region us-east-1
Send message to queue
- aws --endpoint-url=http://localhost:4576 sqs send-message --queue-url http://localhost:4576/queue/test-queue.fifo --message-body "Information about the largest city in Any Region." --message-deduplication-id "123" --message-group-id "group_1" --region us-east-1

Get message off queue to process (visibility-timeout is needed to ensure message queue is locked until process confirmed complete) https://docs.aws.amazon.com/cli/latest/reference/sqs/receive-message.html

- aws --endpoint-url=http://localhost:4576 sqs receive-message --queue-url http://localhost:4576/queue/test-queue.fifo  --attribute-names MessageGroupId --message-attribute-names All --max-number-of-messages 10 --region us-east-1 --visibility-timeout 20
Delete queue
aws --endpoint-url=http://localhost:4576 sqs delete-queue --queue-url http://localhost:4576/queue/test-queue.fifo --region us-east-1
