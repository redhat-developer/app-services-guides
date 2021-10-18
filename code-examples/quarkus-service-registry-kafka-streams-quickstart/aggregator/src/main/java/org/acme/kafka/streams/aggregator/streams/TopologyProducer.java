package org.acme.kafka.streams.aggregator.streams;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.inject.Produces;
import javax.inject.Inject;

import io.apicurio.registry.serde.SerdeConfig;
import io.apicurio.registry.serde.avro.AvroKafkaDeserializer;
import io.apicurio.registry.serde.avro.AvroKafkaSerdeConfig;
import io.apicurio.registry.serde.avro.AvroKafkaSerializer;
import io.apicurio.registry.serde.avro.AvroSerde;
import org.acme.kafka.quarkus.Aggregation;
import org.acme.kafka.quarkus.TemperatureRecord;
import org.acme.kafka.quarkus.WeatherStation;
import org.acme.kafka.streams.aggregator.model.TemperatureMeasurement;
import org.apache.kafka.common.serialization.Serde;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.Topology;
import org.apache.kafka.streams.kstream.Consumed;
import org.apache.kafka.streams.kstream.GlobalKTable;
import org.apache.kafka.streams.kstream.Materialized;
import org.apache.kafka.streams.kstream.Produced;
import org.apache.kafka.streams.state.KeyValueBytesStoreSupplier;
import org.apache.kafka.streams.state.Stores;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class TopologyProducer {

    static final String WEATHER_STATIONS_STORE = "weather-stations-store";

    static final String WEATHER_STATIONS_TOPIC = "weather-stations";
    static final String TEMPERATURE_VALUES_TOPIC = "temperature-values";
    static final String TEMPERATURES_AGGREGATED_TOPIC = "temperatures-aggregated";

    @Inject
    WeatherSerdeConfig weatherSerdeConfig;

    @Produces
    public Topology buildTopology() {
        StreamsBuilder builder = new StreamsBuilder();

        final Map<String, String> serdeConfig = new HashMap<>();

        serdeConfig.put(SerdeConfig.REGISTRY_URL, weatherSerdeConfig.getRegistryUrl());
        serdeConfig.put(SerdeConfig.AUTO_REGISTER_ARTIFACT, weatherSerdeConfig.getAutoRegister());
        serdeConfig.put(SerdeConfig.FIND_LATEST_ARTIFACT, weatherSerdeConfig.getFindLatest());
        serdeConfig.put(SerdeConfig.ARTIFACT_RESOLVER_STRATEGY, weatherSerdeConfig.getResolverStrategy());
        serdeConfig.put(SerdeConfig.AUTH_SERVICE_URL, weatherSerdeConfig.getAuthUrl());
        serdeConfig.put(SerdeConfig.AUTH_REALM, weatherSerdeConfig.getRealm());
        serdeConfig.put(SerdeConfig.AUTH_CLIENT_ID, weatherSerdeConfig.getClientId());
        serdeConfig.put(SerdeConfig.AUTH_CLIENT_SECRET, weatherSerdeConfig.getClientSecret());

        //Build serdes
        final AvroSerde<Aggregation> aggregationSerde = new AvroSerde<>();
        final AvroSerde<WeatherStation> weatherStationSerde = new AvroSerde<>();
        final AvroSerde<TemperatureRecord> temperatureRecordSerde = new AvroSerde<>();

        aggregationSerde.configure(serdeConfig, false);
        weatherStationSerde.configure(serdeConfig, false);
        temperatureRecordSerde.configure(serdeConfig, false);

        KeyValueBytesStoreSupplier storeSupplier = Stores.persistentKeyValueStore(WEATHER_STATIONS_STORE);

        GlobalKTable<Integer, WeatherStation> stations = builder.globalTable(
                WEATHER_STATIONS_TOPIC,
                Consumed.with(Serdes.Integer(), weatherStationSerde));

        builder.stream(
                        TEMPERATURE_VALUES_TOPIC,
                        Consumed.with(Serdes.Integer(), temperatureRecordSerde))
                .join(
                        stations,
                        (stationId, timestampAndValue) -> stationId,
                        (temperatureRecord, station) -> {
                            String[] parts = temperatureRecord.getTemperatureRecord().split(";");
                            return new TemperatureMeasurement(station.getId(), station.getName(), Instant.parse(parts[0]),
                                    Double.valueOf(parts[1]));
                        })
                .groupByKey()
                .aggregate(
                        Aggregation::new,
                        (stationId, value, aggregation) -> updateFrom(aggregation, value),
                        Materialized.<Integer, Aggregation>as(storeSupplier)
                                .withKeySerde(Serdes.Integer())
                                .withValueSerde(aggregationSerde))
                .toStream()
                .to(
                        TEMPERATURES_AGGREGATED_TOPIC,
                        Produced.with(Serdes.Integer(), aggregationSerde));

        return builder.build();
    }

    private static Aggregation updateFrom(Aggregation aggregation, TemperatureMeasurement temperatureMeasurement) {
        aggregation.setStationId(temperatureMeasurement.stationId);
        aggregation.setStationName(temperatureMeasurement.stationName);

        aggregation.setCount(aggregation.getCount() + 1);
        aggregation.setSum(aggregation.getSum() + temperatureMeasurement.value);
        aggregation.setAvg(BigDecimal.valueOf(aggregation.getSum() / aggregation.getCount())
                .setScale(1, RoundingMode.HALF_UP).doubleValue());
        aggregation.setMin(Math.min(aggregation.getMin(), temperatureMeasurement.value));
        aggregation.setMax(Math.max(aggregation.getMax(), temperatureMeasurement.value));

        return aggregation;

    }
}
