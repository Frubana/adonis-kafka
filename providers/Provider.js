const { ServiceProvider } = require('@adonisjs/fold')

class KafkaProvider extends ServiceProvider {
  register () {
    this.app.singleton('Kafka', () => {
      const Config = this.app.use('Adonis/Src/Config')
      const Logger = this.app.use('Adonis/Src/Logger')
      const Helpers = this.app.use('Adonis/Src/Helpers')

      return new (require('../src'))(Config, Logger, Helpers)
    })
  }
}

module.exports = KafkaProvider
