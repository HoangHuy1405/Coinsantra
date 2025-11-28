package com.trading;

import com.microsoft.azure.functions.ExecutionContext;
import com.microsoft.azure.functions.HttpMethod;
import com.microsoft.azure.functions.HttpRequestMessage;
import com.microsoft.azure.functions.HttpResponseMessage;
import com.microsoft.azure.functions.HttpStatus;
import com.microsoft.azure.functions.OutputBinding;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.BindingName;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import com.microsoft.azure.functions.annotation.QueueOutput;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.util.Optional;
import java.util.logging.Level;

public class WebhookReceiver {

    private final Gson gson = new Gson();

    @FunctionName("WebhookReceiver")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req", methods = {
                    HttpMethod.POST }, authLevel = AuthorizationLevel.ANONYMOUS, route = "webhook/{token}") HttpRequestMessage<Optional<String>> request,

            @BindingName("token") String token,

            @QueueOutput(name = "messageOutput", queueName = "trade-signals", connection = "AzureWebJobsStorage") OutputBinding<String> messageOutput,

            final ExecutionContext context) {
        // --- LOGGING START ---
        context.getLogger().info(">>> NEW SIGNAL RECEIVED <<<");
        context.getLogger().info("Token: " + token);
        // --- LOGGING END ---

        String requestBody = request.getBody().orElse("");

        if (requestBody.isEmpty()) {
            context.getLogger().warning("Received empty body. Rejecting.");
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST)
                    .body("Empty payload").build();
        }

        try {
            // Log raw input for debugging
            context.getLogger().info("Raw Body: " + requestBody);

            JsonObject payload = gson.fromJson(requestBody, JsonObject.class);

            JsonObject queueMessage = new JsonObject();
            queueMessage.addProperty("webhookToken", token);
            queueMessage.add("payload", payload);
            queueMessage.addProperty("receivedAt", System.currentTimeMillis());

            String finalJson = gson.toJson(queueMessage);

            // Log what we are actually sending to the queue
            context.getLogger().info("Pushing to Queue: " + finalJson);

            messageOutput.setValue(finalJson);

            return request.createResponseBuilder(HttpStatus.OK).body("Signal Queued").build();

        } catch (Exception e) {
            // Log the actual error stack trace
            context.getLogger().log(Level.SEVERE, "JSON Parsing Error", e);

            return request.createResponseBuilder(HttpStatus.BAD_REQUEST)
                    .body("Invalid JSON").build();
        }
    }
}