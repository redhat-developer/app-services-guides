package org.acme.kafka.streams.aggregator.streams;

import org.eclipse.microprofile.config.inject.ConfigProperty;

import javax.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class WeatherSerdeConfig {

    @ConfigProperty(name = "apicurio.registry.url")
    String registryUrl;

    @ConfigProperty(name = "apicurio.registry.auto-register")
    String autoRegister;

    @ConfigProperty(name = "apicurio.registry.find-latest")
    String findLatest;

    @ConfigProperty(name = "apicurio.registry.artifact-resolver-strategy")
    String resolverStrategy;

    @ConfigProperty(name = "apicurio.auth.realm")
    String realm;

    @ConfigProperty(name = "apicurio.auth.service.url")
    String authUrl;

    @ConfigProperty(name = "apicurio.auth.client.id")
    String clientId;

    @ConfigProperty(name = "apicurio.auth.client.secret")
    String clientSecret;

    public String getRegistryUrl() {
        return registryUrl;
    }

    public String getAutoRegister() {
        return autoRegister;
    }

    public String getFindLatest() {
        return findLatest;
    }

    public String getResolverStrategy() {
        return resolverStrategy;
    }

    public String getRealm() {
        return realm;
    }

    public String getAuthUrl() {
        return authUrl;
    }

    public String getClientId() {
        return clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }
}
