/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const { Kafka } = require("kafkajs");

class Consumer {
  constructor(Logger, config, Helpers) {
    this.Logger = Logger;
    this.Helpers = Helpers;
    this.config = config;
    this.topics = [];
    this.events = {};
    this.killContainer = false;
    this.timeout = null;
    this.consumer = null;

    const kafka = new Kafka({
      clientId: this.config.clientId,
      brokers: this.config.address
    });

    this.consumer = kafka.consumer({ groupId: this.config.groupId });
  }

  async start() {
    await this.consumer.connect();

    await this.consumer.run({
      autoCommit: this.config.autoCommit,
      eachMessage: this.onData.bind(this)
    });
  }

  async onData({ topic, partition, message }) {
    const result = JSON.parse(message.value.toString());

    const events = this.events[topic] || [];

    events.forEach(callback =>
      callback(result, async () => {
        if (this.config.autoCommit) {
          return;
        }

        await this.consumer.commitOffsets([
          { topic, partition, offset: message.offset }
        ]);
      })
    );
  }

  //

  async on(topic, callback) {
    const callbackFunction = this.validateCallback(callback);
    let topicArray = topic;

    if (typeof topic === 'string') {
      topicArray = topic.split(',');
    }

    if (!callbackFunction) {
      throw new Error("We can'f found your controller");
    }

    topicArray.forEach(async (item) => {
      if (!item) {
        return;
      }
      const events = this.events[item] || [];
      events.push(callbackFunction);
      this.events[item] = events;
      this.topics.push(item);
      await this.consumer.subscribe({ topic, fromBeginning: this.config.fromBeginning || true });
    })
  }

  validateCallback(callback) {
    // In this case the service is a function
    if (typeof callback === "function") {
      return callback;
    }

    const splited = callback.split(".");

    const model = splited[0];
    const func = splited[1];

    const root = this.Helpers.appRoot();
    const route = `${root}/app/Controllers/Kafka/${model}`;

    const Module = require(route);
    const controller = new Module();

    if (typeof controller[func] === "function") {
      return controller[func].bind(controller);
    }

    return null;
  }
}

module.exports = Consumer;
