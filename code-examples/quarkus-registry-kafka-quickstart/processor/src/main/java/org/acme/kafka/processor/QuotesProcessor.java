package org.acme.kafka.processor;

import io.smallrye.reactive.messaging.annotations.Blocking;
import org.acme.kafka.quarkus.Quote;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;

import javax.enterprise.context.ApplicationScoped;
import java.util.Random;

/**
 * A bean consuming data from the "quote-requests" Kafka topic (mapped to "requests" channel) and giving out a random quote.
 * The result is pushed to the "quotes" Kafka topic.
 */
@ApplicationScoped
public class QuotesProcessor {

    private Random random = new Random();

    @Incoming("requests")
    @Outgoing("quotes")
    @Blocking
    public Quote process(Quote quoteRequest) throws InterruptedException {
        // simulate some hard working task
        Thread.sleep(200);
        return new Quote(quoteRequest.getId(), random.nextInt(100));
    }
}
