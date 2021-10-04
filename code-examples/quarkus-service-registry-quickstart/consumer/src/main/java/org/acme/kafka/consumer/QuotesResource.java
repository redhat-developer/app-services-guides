package org.acme.kafka.consumer;


import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.acme.kafka.quarkus.Quote;
import org.eclipse.microprofile.reactive.messaging.Channel;

import io.smallrye.mutiny.Multi;
import org.jboss.resteasy.reactive.RestSseElementType;

@Path("/quotes")
public class QuotesResource {

    @Channel("quotes")
    Multi<Quote> quotes;

    /**
     * Endpoint retrieving the "quotes" Kafka topic and sending the items to a server sent event.
     */
    @GET
    @Produces(MediaType.SERVER_SENT_EVENTS) // denotes that server side events (SSE) will be produced
    @RestSseElementType(MediaType.TEXT_PLAIN)
    public Multi<Quote> stream() {
        return quotes.log();
    }
}

