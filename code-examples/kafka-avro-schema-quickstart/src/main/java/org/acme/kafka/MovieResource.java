package org.acme.kafka;


import org.acme.kafka.quarkus.Movie;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.jboss.logging.Logger;

import javax.ws.rs.Produces;
import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.Response;
import org.jboss.resteasy.annotations.SseElementType;
import javax.ws.rs.core.MediaType;
import org.reactivestreams.Publisher;

@Path("/movies")
public class MovieResource {
    private static final Logger LOGGER = Logger.getLogger(MovieResource.class);

    
    @Inject
    @Channel("movies-from-kafka")
    Publisher<Movie> movies;

    @GET
    @Path("/stream")
    @Produces(MediaType.SERVER_SENT_EVENTS) // denotes that server side events (SSE) will be produced
    @SseElementType("text/plain") // denotes that the contained data, within this SSE, is just regular text/plain data
    public Publisher<Movie> stream() {
        return movies;
    }

}