import Queue from 'bull';

import { ExpirationPublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST
  }
})

expirationQueue.process(async (job) => {
  new ExpirationPublisher(natsWrapper.client).publish({
    orderId: job.data.orderId
  });
});

export { expirationQueue };