export default class SubscriptionWrapper {
  constructor() {
     this.Subscribers = new Set();
  }

  sub(stream, data) {
    stream.write(JSON.stringify(data));
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
    this.Subscribers.forEach((sub) => {
      sub.write(JSON.stringify(data));
    })
  }
}
