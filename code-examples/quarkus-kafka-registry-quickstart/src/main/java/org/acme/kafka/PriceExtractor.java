package org.acme.kafka;

import javax.enterprise.context.ApplicationScoped;

import org.eclipse.microprofile.reactive.messaging.Acknowledgment;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;

import io.smallrye.reactive.messaging.annotations.Broadcast;

/**
 * A bean consuming data from the "prices-complex" Kafka topic, and producing a stream of
 * prices in Euros using the US price and conversion rate included in each message.
 *
 * The result is pushed to the "my-data-stream" stream which is an in-memory stream.
 */
@ApplicationScoped
public class PriceExtractor {

    // Consume from the `prices` channel and produce to the `my-data-stream` channel
    @Incoming("prices")
    @Outgoing("my-data-stream")
    // Send to all subscribers
    @Broadcast
    // Acknowledge the messages before calling this method.
    @Acknowledgment(Acknowledgment.Strategy.PRE_PROCESSING)
    public double process(Price price) {
        return price.getUsDollars() * price.getConversionRate();
    }

}
