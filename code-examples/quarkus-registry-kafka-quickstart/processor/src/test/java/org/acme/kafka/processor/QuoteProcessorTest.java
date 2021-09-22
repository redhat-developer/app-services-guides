package org.acme.kafka.processor;

import io.apicurio.registry.serde.SerdeConfig;
import io.apicurio.registry.serde.avro.AvroKafkaDeserializer;
import io.apicurio.registry.serde.avro.AvroKafkaSerdeConfig;
import io.apicurio.registry.serde.avro.AvroKafkaSerializer;
import io.quarkus.test.junit.QuarkusTest;
import io.smallrye.common.annotation.Identifier;
import org.acme.kafka.quarkus.Quote;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.inject.Inject;
import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import static org.junit.jupiter.api.Assertions.assertEquals;

@QuarkusTest
public class QuoteProcessorTest {

    @Inject
    @Identifier("default-kafka-broker")
    Map<String, Object> kafkaConfig;

    KafkaProducer<String, Quote> quoteRequestProducer;
    KafkaConsumer<String, Quote> quoteConsumer;

    @BeforeEach
    void setUp() {

        AvroKafkaDeserializer<Quote> avroKafkaDeserializer = new AvroKafkaDeserializer<>();
        AvroKafkaSerializer<Quote> avroKafkaSerializer = new AvroKafkaSerializer<>();

        avroKafkaSerializer.configure(producerConfig(), false);
        avroKafkaDeserializer.configure(consumerConfig(), false);

        quoteConsumer = new KafkaConsumer<>(consumerConfig(), new StringDeserializer(), avroKafkaDeserializer);
        quoteRequestProducer = new KafkaProducer<>(producerConfig(), new StringSerializer(), avroKafkaSerializer);
    }

    @AfterEach
    void tearDown() {
        quoteRequestProducer.close();
        quoteConsumer.close();
    }

    Map<String, Object> consumerConfig() {
        Map<String, Object> properties = new HashMap<String, Object>(kafkaConfig);
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, "test-group-id");
        properties.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true");
        properties.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        properties.put(SerdeConfig.REGISTRY_URL, "http://localhost:8888/apis/registry/v2");
        properties.put(AvroKafkaSerdeConfig.USE_SPECIFIC_AVRO_READER, true);
        return properties;
    }

    Map<String, Object> producerConfig() {
        Map<String, Object> properties = new HashMap<String, Object>(kafkaConfig);
        properties.put(SerdeConfig.REGISTRY_URL, "http://localhost:8888/apis/registry/v2");
        properties.put(SerdeConfig.AUTO_REGISTER_ARTIFACT, true);
        return properties;
    }

    @Test
    void testProcessor() {
        quoteConsumer.subscribe(Collections.singleton("quotes"));
        UUID quoteId = UUID.randomUUID();
        quoteRequestProducer.send(new ProducerRecord<>("quote-requests", new Quote(quoteId.toString(), ThreadLocalRandom.current().nextInt())));
        ConsumerRecords<String, Quote> records = quoteConsumer.poll(Duration.ofMillis(10000));
        Quote quote = records.records("quotes").iterator().next().value();
        assertEquals(quote.getId(), quoteId.toString());
    }
}
