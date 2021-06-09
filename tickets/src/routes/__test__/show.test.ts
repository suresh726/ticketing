import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';

it('returns 404 for non-existing ticket', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(404);
});

it('returns the ticket for valid id', async () => {
  const title = 'My precious';
  const price = 20.05;
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({title, price})
    .expect(201);
  
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);

});