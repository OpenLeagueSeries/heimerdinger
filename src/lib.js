export default class SubscriptionWrapper {
  constructor() {
     this.Subscribers = new Set();
  }

  sub(stream, data) {
    const p = Promise.resolve(data);
    p.then((d) => {
      stream.write(JSON.stringify(d));
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
      console.log(d);
      this.Subscribers.forEach((sub) => {
        sub.write(JSON.stringify(d));
      })
    })
  }
}
