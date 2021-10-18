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

package org.acme.kafka.kstreams;


import io.apicurio.registry.serde.SerdeConfig;
import io.apicurio.registry.serde.avro.AvroKafkaSerdeConfig;
import io.apicurio.registry.serde.avro.AvroSerde;
import io.apicurio.registry.serde.avro.strategy.RecordIdStrategy;
import org.acme.kafka.schema.avro.Event;
import org.acme.kafka.schema.avro.Order;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.Topology;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.Produced;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class KStreamsTopologyProducer {

    private static final String ORDERS_TOPIC = "orders";
    private static final String EVENTS_TOPIC = "events";

    @ConfigProperty(name = "apicurio.registry.url")
    String registryUrl;

    @ConfigProperty(name = "apicurio.auth.realm")
    String realm;

    @ConfigProperty(name = "apicurio.auth.service.url")
    String authUrl;

    @ConfigProperty(name = "apicurio.auth.client.id")
    String clientId;

    @ConfigProperty(name = "apicurio.auth.client.secret")
    String clientSecret;

    @Produces
    public Topology buildTopology() {
        StreamsBuilder builder = new StreamsBuilder();

        Map<String, Object> ordersConfig = new HashMap<>();
        ordersConfig.put(SerdeConfig.REGISTRY_URL, registryUrl);
        setCommonConfig(ordersConfig);

        AvroSerde<Order> ordersSerde = new AvroSerde<>();
        ordersSerde.configure(ordersConfig, false);

        Map<String, Object> eventsConfig = new HashMap<>();
        eventsConfig.put(SerdeConfig.REGISTRY_URL, registryUrl);
        eventsConfig.put(SerdeConfig.FIND_LATEST_ARTIFACT, true);
        eventsConfig.put(SerdeConfig.AUTO_REGISTER_ARTIFACT, true);
        setCommonConfig(eventsConfig);

        AvroSerde<Event> eventsSerde = new AvroSerde<>();
        eventsSerde.configure(eventsConfig, false);

        builder.stream(
                    ORDERS_TOPIC,
                    Consumed.with(Serdes.String(), ordersSerde)
                )
                .transform(OrdersTransformer::new)
                .to(
                    EVENTS_TOPIC,
                    Produced.with(Serdes.String(), eventsSerde)
                );

        return builder.build();
    }

    private void setCommonConfig(Map<String, Object> eventsConfig) {
        eventsConfig.put(AvroKafkaSerdeConfig.USE_SPECIFIC_AVRO_READER, true);
        eventsConfig.put(SerdeConfig.ARTIFACT_RESOLVER_STRATEGY, RecordIdStrategy.class);
        eventsConfig.put(SerdeConfig.AUTH_SERVICE_URL, authUrl);
        eventsConfig.put(SerdeConfig.AUTH_REALM, realm);
        eventsConfig.put(SerdeConfig.AUTH_CLIENT_ID, clientId);
        eventsConfig.put(SerdeConfig.AUTH_CLIENT_SECRET, clientSecret);
    }

}