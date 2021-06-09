import mongoose from 'mongoose';
import request from 'supertest';
import { TicketUpdatedEvent } from '@slctickets/common';
import { Message } from 'node-nats-streaming';

import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
  // creates an instance of listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // creates and save the ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'secret',
    price: 20,
  });
  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new secret',
    price: 99,
    userId: new mongoose.Types.ObjectId().toHexString()
  }

  // create fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };
  return { listener, ticket, data, msg };
}

it('finds, updates, and saves a ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  // call the onMessage with data + message
  await listener.onMessage(data, msg);

  // write assertions to make sure ticket is saved
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("does not call ack if out-of-order events are arrived", async () => {
  const { listener, ticket, data, msg } = await setup();

  data.version = 10;


  try {
    await listener.onMessage(data, msg);
  } catch (err) {

  }
  expect(msg.ack).not.toHaveBeenCalled();
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage with data + message
  await listener.onMessage(data, msg);

  // write assertions to make sure ack is called
  expect(msg.ack).toHaveBeenCalled();
});