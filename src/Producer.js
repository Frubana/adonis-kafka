const { Kafka } = require("kafkajs");

class Producer {
  constructor(Logger, config) {
    this.Logger = Logger;
    this.config = config;

    const kafka = new Kafka({
      clientId: this.config.clientId,
      brokers: this.config.address,
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

    let messages = Array.isArray(data) ? data : [data];
    messages = messages.map(message => {
      if (!message.value) {
        message = { 
          value: JSON.stringify(message) 
        }
      }
      
      if (typeof message.value !== "string") {
        message.value = JSON.stringify(message.value);
      }

      return message;
    });

    await this.producer.send({
      topic,
      messages,
    });

    this.Logger.info("sent data to kafka.");
  }
}

module.exports = Producer;
