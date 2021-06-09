import { Message } from 'node-nats-streaming';
import { Listener, OrderCancelledEvent, Subjects, OrderStatus } from '@slctickets/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // Find the order associated to event
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1
    });

    console.log(data);

    if (!order) {
      console.log('Inside no foudn order');
      throw new Error('Order Not Found');
    }

    // Mark the ticket as reserved & Save
    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    // Ack the message
    msg.ack();
  }

}