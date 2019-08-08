const Kafka = require('node-rdkafka')

class Consumer {
  constructor (Logger, config, Helpers) {
    this.Logger = Logger
    this.Helpers = Helpers

    this.topics = []
    this.events = {}
    this.killContainer = false
    this.timeout = null
    this.consumer = null

    this.consumer = new Kafka.KafkaConsumer(config, {})
  }

  start () {
    this.consumer.connect()

    this.Logger.info('Connecting Kafka')

    this.consumer
      .on('ready', this.onReady.bind(this))
      .on('data', this.onData.bind(this))
      .on('event.error', this.onEventError.bind(this))
      .on('disconnected', this.onDisconnected.bind(this))
  }

  onReady () {
    this.consumer.consume()
    this.consumer.subscribe(this.topics)

    this.Logger.info('listening kafka')
  }

  onDisconnected (error) {
    this.Logger.error('disconnected on consumer', error)

    this.Logger.info('trying to reconnect consumer')

    this.consumer.consume()
    this.consumer.subscribe(this.topics)
  }

  onData (data) {
    const result = JSON.parse(data.value.toString())

    const events = this.events[data.topic] || []

    events.forEach(callback =>
      callback(result, this.consumer.commit.bind(this.consumer))
    )
  }

  onEventError (err) {
    this.killContainer = true

    this.timeout = setTimeout(() => {
      if (this.killContainer) {
        this.Logger.error('killing the container...')
        process.exit(1)
      }
    }, 10000)

    this.Logger.error('event error on consumer', err)
  }

  rebalance (err, assign) {
    if (!this.consumer) {
      return
    }

    if (err.code === Kafka.CODES.ERRORS.ERR__ASSIGN_PARTITIONS) {
      this.consumer.assign(assign)
      this.killContainer = false
      clearTimeout(this.timeout)
      this.Logger.info('assigned partitions')
      return
    }

    if (err.code === Kafka.CODES.ERRORS.ERR__REVOKE_PARTITIONS) {
      // Same as above
      this.consumer.unassign()
      return
    }

    this.Logger.error(err)
  }

  //

  on (topic, callback) {
    const callbackFunction = this.validateCallback(callback)

    if (!callbackFunction) {
      throw new Error("We can'f found your controller")
    }

    this.topics.push(topic)

    const events = this.events[topic] || []
    events.push(callbackFunction)
    this.events[topic] = events

    if (this.consumer.isConnected()) {
      this.consumer.subscribe(this.topics)
    }
  }

  validateCallback (callback) {
    // In this case the service is a function
    if (typeof callback === 'function') {
      return callback
    }

    const splited = callback.split('.')

    const model = splited[0]
    const func = splited[1]

    const root = this.Helpers.appRoot()
    const route = `${root}/app/Controllers/Kafka/${model}`

    const Module = require(route)
    const controller = new Module()

    if (typeof controller[func] === 'function') {
      return controller[func].bind(controller)
    }

    return null
  }
}

module.exports = Consumer
