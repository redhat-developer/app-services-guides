package org.acme.kafka.producer;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.path.json.JsonPath;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@QuarkusTest
public class QuotesResourceTest {

    @Test
    void testQuotesEventStream() {
        JsonPath body = given()
                .when()
                .post("/quotes/request")
                .then()
                .statusCode(200)
                .extract().body()
                .jsonPath();
        assertDoesNotThrow(() -> UUID.fromString(body.get("id")));
    }
}
