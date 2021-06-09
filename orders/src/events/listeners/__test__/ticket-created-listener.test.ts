import mongoose from 'mongoose';
import { TicketCreatedEvent } from '@slctickets/common';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { TicketCreatedListener } from '../ticket-created-listener';

const setup = async () => {
  // creates an instance of listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'secret',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString()
  }

  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };
  return { listener, data, msg };
}

it('creates and saves a ticket', async () => {
  const { listener, data, msg }  = await setup();

  // call the onMessage with data + message
  await listener.onMessage(data, msg);

  // write assertions to make sure ticket is saved
  const ticket = await Ticket.findById(data.id);
  
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage with data + message
  await listener.onMessage(data, msg);

  // write assertions to make sure ack is called
  expect(msg.ack).toHaveBeenCalled();
});