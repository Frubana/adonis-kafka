const Kafka = require('node-rdkafka')

class Producer {
  constructor (Logger, config) {
    this.Logger = Logger
    this.producer = new Kafka.Producer(config, {})
  }

  start () {
    this.producer.connect()
  }

  send (topic, data) {
    if (typeof data !== 'object') {
      throw new Error('You need send a json object in data argument')
    }

    // eslint-disable-next-line new-cap
    const buffer = new Buffer.from(JSON.stringify(data))

    this.producer.produce(topic, null, buffer, null, Date.now(), null)

    this.Logger.info('sent data to kafka.')
  }
}

module.exports = Producer
