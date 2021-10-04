package org.acme.kafka.producer;

import io.smallrye.mutiny.Multi;
import org.acme.kafka.quarkus.Quote;
import org.eclipse.microprofile.reactive.messaging.Outgoing;

import javax.enterprise.context.ApplicationScoped;
import java.time.Duration;
import java.util.Random;
import java.util.UUID;

/**
 * A bean producing data to the "quotes" Kafka topic.
 */
@ApplicationScoped
public class QuotesProducer {

    private final Random random = new Random();

    @Outgoing("quotes")
    public Multi<Quote> generate() {
        return Multi.createFrom().ticks().every(Duration.ofSeconds(5))
                .onOverflow().drop()
                .map(tick -> new Quote(UUID.randomUUID().toString(), random.nextInt(100)));
    }
}
