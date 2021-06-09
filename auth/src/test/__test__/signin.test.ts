import request from 'supertest';
import { app } from '../../app';

it('fails when non-existing user attempts to sign in', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: "test@test.com",
      password: "password"
    })
    .expect(400);
});

it('fails when existing user attempts to sign in with invalid password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: "test@test.com",
      password: "password"
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: "test@test.com",
      password: "password1"
    })
    .expect(400);
});

it('sets cookie when existing user attempts to sign in with valid creds', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: "test@test.com",
      password: "password"
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: "test@test.com",
      password: "password"
    })
    .expect(200);
  expect(response.get('Set-Cookie')).toBeDefined();
});