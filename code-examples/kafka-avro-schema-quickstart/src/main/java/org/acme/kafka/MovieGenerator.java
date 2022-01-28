package org.acme.kafka;
import java.time.Duration;
import java.util.Random;

import javax.enterprise.context.ApplicationScoped;

import io.smallrye.mutiny.Multi;

import org.acme.kafka.quarkus.Movie;
import org.eclipse.microprofile.reactive.messaging.Outgoing;

/**
 * A bean producing random prices every 5 seconds.
 * The prices are written to a Kafka topic (prices). The Kafka configuration is specified in the application configuration.
 */
@ApplicationScoped
public class MovieGenerator {
    
    private Random random = new Random();

    @Outgoing("movies-to-kafka")
    public Multi<Movie> generate() {
        return Multi.createFrom().ticks().every(Duration.ofSeconds(5))
                .onOverflow().drop()
                .map(tick -> MOVIES[random.nextInt(MOVIES.length)]);
    }

    private static final Movie[] MOVIES = {
        new Movie("The Shawshank Redemption", 1994),
        new Movie("12 Angry Men", 1957),
        new Movie("The Godfather", 1972),
        new Movie("The Dark Knight", 2008)
    };

}
