package org.example;

import org.apache.kafka.clients.producer.ProducerConfig;

import java.util.Properties;

public class KafkaConfig {

    static Properties properties() {

        String kafkaHost = System.getenv("KAFKA_HOST");
        String rhoasClientID = System.getenv("RHOAS_SERVICE_ACCOUNT_CLIENT_ID");
        String rhoasClientSecret = System.getenv("RHOAS_SERVICE_ACCOUNT_CLIENT_SECRET");
        String rhoasOauthTokenUrl = System.getenv("RHOAS_SERVICE_ACCOUNT_OAUTH_TOKEN_URL");

        var properties= new Properties();

        properties.setProperty(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaHost);
        properties.setProperty("security.protocol", "SASL_SSL");
        properties.setProperty("sasl.mechanism", "OAUTHBEARER");

        properties.setProperty("sasl.jaas.config", "org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule required clientId=\"" + rhoasClientID + "\" clientSecret=\"" + rhoasClientSecret + "\" oauth.token.endpoint.uri=\"" + rhoasOauthTokenUrl + "\";");

        properties.setProperty("sasl.login.callback.handler.class", "org.apache.kafka.common.security.oauthbearer.secured.OAuthBearerLoginCallbackHandler");
        properties.setProperty("sasl.oauthbearer.token.endpoint.url", rhoasOauthTokenUrl);
        properties.setProperty("sasl.oauthbearer.scope.claim.name", "api.iam.service_accounts");

        return properties;
    }
}
