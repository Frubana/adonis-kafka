const Consumer = require('./Consumer')
const Producer = require('./Producer')

class KafkaConsumer {
  constructor (Config, Logger, Helpers) {
    this.Config = Config.get('kafka')
    this.Logger = Logger
    this.Helpers = Helpers

    this._start()
  }

  _start () {
    const { groupId, url, autoCommit, port, urls } = this.Config

    if (groupId === null || groupId === undefined || groupId === '') {
      throw new Error('You need define a group')
    }

    if (url === null || url === undefined || url === '') {
      throw new Error('You need define a kafka url')
    }

    const address = urls || `${url}:${port}`

    const conf = {
      'group.id': groupId,
      'enable.auto.commit': autoCommit,
      'metadata.broker.list': address,
      offset_commit_cb: this._onCommit.bind(this)
      // rebalance_cb: this.rebalance
    }

    this.consumer = new Consumer(this.Logger, conf, this.Helpers)
    this.producer = new Producer(this.Logger, conf, this.Helpers)

    this.consumer.start()
    this.producer.start()
  }

  on (topic, callback) {
    this.consumer.on(topic, callback)
  }

  send (topic, data) {
    this.producer.send(topic, data)
  }

  _onCommit (err, topicPartitions) {
    if (err) {
      // There was an error committing
      this.Logger.error('There was an error commiting', err)
      throw new Error(err)
    }

    // Commit went through. Let's log the topic partitions
    this.Logger.info('commited', topicPartitions)
  }
}

module.exports = KafkaConsumer
