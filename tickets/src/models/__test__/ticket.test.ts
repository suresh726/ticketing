import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    title: 'Blah Bla',
    price: 5,
    userId: '124'
  });
  
  // Save ticket to db
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes
  firstInstance!.set({ price: 10 });
  secondInstance!.set({ price: 15 });

  // save individual ticket with diff values
  await firstInstance!.save();

  try {
    await secondInstance!.save();
  } catch (err) {
    console.log('error as expected');
    return;
  }
  throw new Error('Should not reach to this point');

});

it('increments the version number', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    title: 'Blah Bla',
    price: 5,
    userId: '124'
  });

  // Save ticket to db
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});