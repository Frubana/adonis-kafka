const { Command } = require('@adonisjs/ace')

class NewKafkaController extends Command {
  static get signature () {
    return `
      make:kafka
      { name : Name of the controller }
    `
  }

  static get description () {
    return 'Create a kafka controller.'
  }

  handle (args, options) {
    console.log(args, options)
  }
}

module.exports = NewKafkaController
