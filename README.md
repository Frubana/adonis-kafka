# Kafka Adonis Provider

## Setup

Add kafka when your app start.

```js
// server.js

new Ignitor(fold)
  .appRoot(__dirname)
  // Only add the next line
  .preLoad("start/kafka")
  .fireHttpServer()
  .catch(console.error);
```

Make sure to register the provider and make all of the following necessary changes inside the `start/app.js` file!

```js
// Add the kafka provider
const providers = [
  // ...
  "@frubana/adonis-kafka/providers/Provider"
];
```

## Config

Please update configuration before use. The configuration file is `config/kafka.js`.

## Adding topics

```js
// start/kafka.js

const Kafka = use("Kafka");

// Callback function
Kafka.on("topic_name", (data, commit) => {
  commit();
});

// Controller function
Kafka.on("topic_name", "TestController.index");
```

## Define your controller

```js
// app/Controllers/Kafka/TestController.js

/** @type {import('@adonisjs/framework/src/Logger')} */
const Logger = use("Logger");

class TestController {
  index(data, commit) {
    Logger.info("kafka data", data);

    commit();
  }
}

module.exports = TestController;
```

## Produce events

```js
// app/Controllers/Http/TestController.js

const Kafka = use("Kafka");

class TestController {
  somefunction() {
    // data is a json object

    const data = {};
    Kafka.send("topicname", data);
  }
}
```
