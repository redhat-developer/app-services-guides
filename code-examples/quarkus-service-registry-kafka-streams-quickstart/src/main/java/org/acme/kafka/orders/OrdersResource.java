/*
 * Copyright 2021 Red Hat
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.acme.kafka.orders;

import org.acme.kafka.schema.avro.Order;
import org.eclipse.microprofile.reactive.messaging.Channel;
import org.eclipse.microprofile.reactive.messaging.Emitter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import java.util.UUID;


@Path("orders")
public class OrdersResource {

    Logger log = LoggerFactory.getLogger(this.getClass());

    @Inject
    @Channel("orders")
    Emitter<Order> ordersKafka;

    @GET
    @Path("{item}/{quantity}")
    public void publish(@PathParam("item") String item, @PathParam("quantity") Integer quantity) {
        log.info("Producing order");
        Order order = new Order();
        order.setId(UUID.randomUUID().toString());
        order.setItem(item);
        order.setQuantity(quantity);
        ordersKafka.send(order);
    }
}
