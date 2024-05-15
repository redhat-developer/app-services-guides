package org.example;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.common.serialization.StringSerializer;

public class ProducerExample {

    public static void main(String[] args) {

        //Creating producer properties
        var properties= KafkaConfig.properties();
        properties.setProperty(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        properties.setProperty(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

        KafkaProducer<String,String> producer= new KafkaProducer<String,String>(properties);

        producer.send(new ProducerRecord<>("prices", "Test Message"));
        producer.flush();
        producer.close();
    }
}