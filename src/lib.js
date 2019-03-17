export default class SubscriptionWrapper {
  constructor() {
     this.Subscribers = new Set();
  }

  sub(stream, data) {
    const p = Promise.resolve(data);
    p.then((d) => {
      console.log('SUBSCRIPTION', ' : ', 'starting new subscription with ', d);
      stream.write(`data: ${d}\n\n`);
    });
    stream.on('end', () => {
      this.unsub(stream);
    });
    return this.Subscribers.has(stream) || this.Subscribers.add(stream);
  }

  unsub(subscriber) {
    this.Subscribers.delete(subscriber);

    if (this.Subscribers.length === 0) {
      return false;
    }
    return true;
  }

  update(data) {
    Promise.resolve(data).then((d)=> {
      console.log('SUBSCRIPTION', ' : ', 'updating subscription with new data', d);
      for (let sub of this.Subscribers) {
        sub.write(`data: ${d}\n\n`);
      }
    })
  }

  fire(event, data) {
    Promise.resolve(data).then((d)=> {
      console.log('SUBSCRIPTION', ' : ', 'updating subscription with event', event);
      for (let sub of this.Subscribers) {
        sub.write(`event: ${event}\ndata: ${d}\n\n`);
      }
    })
  }
}
