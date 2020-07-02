const { Kafka } = require("kafkajs");

class Producer {
  constructor(Logger, config) {
    this.Logger = Logger;
    this.config = config;

    const kafka = new Kafka({
      clientId: this.config.clientId,
      brokers: this.config.address
    });

    this.producer = kafka.producer();
  }

  async start() {
    await this.producer.connect();
  }

  async send(topic, data) {
    if (typeof data !== "object") {
      throw new Error("You need send a json object in data argument");
    }

    await this.producer.send({
      topic: topic,
      messages: data
    });

    this.Logger.info("sent data to kafka.");
  }
}

module.exports = Producer;
