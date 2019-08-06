/** @type {import('@adonisjs/framework/src/Logger')} */
const Logger = use('Logger')

class TestController {
  index (data, commit) {
    Logger.info('kafka data', data)

    commit()
  }
}

module.exports = TestController
