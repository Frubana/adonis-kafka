const Consumer = require("./Consumer");
const Producer = require("./Producer");

class KafkaConsumer {
  constructor(config, Logger, Helpers) {
    this.config = config.get("kafka");
    this.Logger = Logger;
    this.Helpers = Helpers;

    this.start();
  }

  start() {
    const { groupId, url, port, urls } = this.config;

    if (groupId === null || groupId === undefined || groupId === "") {
      throw new Error("You need define a group");
    }

    if ((url === null || url === undefined || url === "") && (!urls)) {
      throw new Error("You need define a kafka url");
    }

    const address = urls || [`${url}:${port}`];

    this.config.address = address;

    this.consumer = new Consumer(this.Logger, this.config, this.Helpers);
    this.producer = new Producer(this.Logger, this.config, this.Helpers);

    this.consumer.start();
    this.producer.start();
  }

  on(topic, callback) {
    this.consumer.on(topic, callback);
  }

  send(topic, data) {
    this.producer.send(topic, data);
  }

  onCommit(err, topicPartitions) {
    if (err) {
      // There was an error committing
      this.Logger.error("There was an error commiting", err);
      throw new Error(err);
    }

    // Commit went through. Let's log the topic partitions
    this.Logger.info("commited", topicPartitions);
  }
}

module.exports = KafkaConsumer;
