import request from 'supertest';

import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';


it('has a route handler listening to POST /api/tickets', async () =>{
  const response = await request(app)
    .post('/api/tickets')
    .send({});

    expect(response.status).not.toEqual(404);
});

it('can only be accessible by logged-in users', async () => {
  await request(app)
    .post('/api/tickets')
    .send({}).expect(401);
});

it('allows to POST /api/tickets for logged-in users', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('returns an error for invalid title', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: '',
      'price': 10
    })
    .expect(400);
  
    await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      'price': 10
    })
    .expect(400);
});

it('returns an error for invalid price', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'First Ticket',
      'price': -10
    })
    .expect(400);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      'title': 'My Precious'
    })
    .expect(400);
});

it('creates a ticket for valid title, price', async () => {
  // add if the record is in db
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  const title = 'My precious';
  const price = 29.5
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      'title': title,
      'price': price
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual(price);
});

it('publishes an event', async () => {
  // add if the record is in db
  const title = 'My precious';
  const price = 29.5
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      'title': title,
      'price': price
    })
    .expect(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});