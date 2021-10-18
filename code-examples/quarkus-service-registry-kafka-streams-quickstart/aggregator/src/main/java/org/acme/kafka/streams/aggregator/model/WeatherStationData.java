package org.acme.kafka.streams.aggregator.model;

import io.quarkus.runtime.annotations.RegisterForReflection;
import org.acme.kafka.quarkus.Aggregation;

@RegisterForReflection
public class WeatherStationData {

    public int stationId;
    public String stationName;
    public double min = Double.MAX_VALUE;
    public double max = Double.MIN_VALUE;
    public int count;
    public double avg;

    private WeatherStationData(int stationId, String stationName, double min, double max, int count, double avg) {
        this.stationId = stationId;
        this.stationName = stationName;
        this.min = min;
        this.max = max;
        this.count = count;
        this.avg = avg;
    }

    public static WeatherStationData from(Aggregation aggregation) {
        return new WeatherStationData(
                aggregation.getStationId(),
                aggregation.getStationName(),
                aggregation.getMin(),
                aggregation.getMax(),
                aggregation.getCount(),
                aggregation.getAvg());
    }
}
