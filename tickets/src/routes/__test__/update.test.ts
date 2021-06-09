import request from 'supertest';
import mongoose from 'mongoose';

import { natsWrapper } from '../../nats-wrapper';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('returns a 404 for non-existing ticket id', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/users/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({ title: 'My Prec', price: 31})
    .expect(404);
});

it('returns 401 for unauthenticated user tryig to access UPDATE ticket API', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/users/tickets/${id}`)
    .send({ title: 'My Prec', price: 31 })
    .expect(404);
});

it('returns 401 if authenticated but non-owner tries to update the ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'My Prec', price: 31 })
    .expect(201);

    await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'My Prec Updated', price: 31 })
    .expect(401);
});

it('returns 400 if the user provides invalid input', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'My Prec', price: 31 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 31 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'My Prec Updated'})
    .expect(400);
});

it('returns 400 if the user tries to update locked ticket', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'My Prec', price: 31 })
    .expect(201);
  
  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 31 })
    .expect(400);
});

it('updates the ticket', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'My Prec', price: 31 })
    .expect(201);
  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'My Prec Updated', price: 100 })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('My Prec Updated');
  expect(ticketResponse.body.price).toEqual(100);
});

it('publishes an update event', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'My Prec', price: 31 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'My Prec Updated', price: 100 })
    .expect(200);
  
  expect(natsWrapper.client.publish).toHaveBeenCalled();
})
