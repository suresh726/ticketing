import { Subjects, Publisher, ExpirationCompleteEvent } from '@slctickets/common';

export class ExpirationPublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}