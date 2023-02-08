package org.example;

import java.util.Arrays;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import java.time.Duration;

public class ConsumerExample {

    public static void main(String[] args) {

        var properties= KafkaConfig.properties();
        int MAX_MESSAGES_CONSUMED = 1;
        int messagesCount = 0;

        if(args.length > 0) {
            MAX_MESSAGES_CONSUMED = Integer.parseInt(args[0]);
        }

        properties.setProperty(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        properties.setProperty(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        properties.setProperty(ConsumerConfig.GROUP_ID_CONFIG,"test_group_2");
        properties.setProperty(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        KafkaConsumer<String,String> consumer = new KafkaConsumer<String,String>(properties);

        //Subscribing
        consumer.subscribe(Arrays.asList("prices"));

        //polling
        while(true){
            if(messagesCount >= MAX_MESSAGES_CONSUMED) {
                break;
            }
            ConsumerRecords<String,String> records=consumer.poll(Duration.ofMillis(100));
            for(ConsumerRecord<String,String> record: records) {
                System.out.println("Key: "+ record.key() + ", Value:" +record.value());
                System.out.println("Partition:" + record.partition()+",Offset:"+record.offset());
                messagesCount ++;
            }
        }
    }
}
