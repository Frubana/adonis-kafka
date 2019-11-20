const Kafka = use("Kafka");

Kafka.on("topic_name", (data, commit) => {
  commit();
});

Kafka.on("topic_name", "TestController.index");
