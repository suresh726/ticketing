import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS Client is not defined');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NO NATS URL');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS Cluster ID is undefined');
  }
  try {
    await natsWrapper.connect('ticketing', 'blahd', 'http://nats-srv:4222');

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    
  } catch (err) {
    console.error(err)
  }

};

start();
