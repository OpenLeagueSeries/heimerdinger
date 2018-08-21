export default class SubscriptionWrapper {
  let Subscribers = new Set();
  constructor() {
     Subscribers = new Set();
  }

  sub(subscriber, data) {
    subscriber.write(JSON.stringify(data));
    return Subscribers.has(stream) || Subscribers.add(stream);
  }

  unsub(subscriber) {
    Subscribers.delete(subscriber);

    if (Subscribers.length === 0) {
      return false;
    }
    return true;
  }

  update(data) {
    Subscribers.forEach((sub) => {
      sub.write(JSON.stringify(data));
    })
  }
}
