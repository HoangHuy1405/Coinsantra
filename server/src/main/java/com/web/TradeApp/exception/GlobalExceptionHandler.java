package com.web.TradeApp.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.servlet.http.HttpServletRequest;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({
            NoResourceFoundException.class,
            NoSuchElementException.class,
            UsernameNotFoundException.class,
            UserNotFoundException.class,
            IdInvalidException.class
    })
    public ProblemDetail handleNotFoundException(Exception ex) {
        ex.printStackTrace();

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
        problem.setTitle("Resource Not Found");
        problem.setDetail(ex.getMessage());
        problem.setType(URI.create(""));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail handleBadCredentials(BadCredentialsException ex) {
        ex.printStackTrace();

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.UNAUTHORIZED);
        problem.setTitle("Authentication failed");
        problem.setDetail("Invalid username or password");
        problem.setType(URI.create(""));
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationException(MethodArgumentNotValidException ex) {
        ex.printStackTrace();

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problem.setTitle("Validation Failed");

        // Collect only field + message
        String errorSummary = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .reduce((a, b) -> a + ", " + b)
                .orElse("Invalid request payload");

        problem.setDetail(errorSummary);
        problem.setType(URI.create(""));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        ex.printStackTrace();

        String cause = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : "";
        String detailMessage = "A data conflict occurred.";

        // Extract a human-readable cause from the DB message (basic heuristic)
        if (cause.toLowerCase().contains("duplicate")) {
            // Show which value caused the conflict without leaking table/constraint names
            int start = cause.indexOf("Duplicate entry");
            if (start != -1) {
                // Get the quoted value if possible
                int quoteStart = cause.indexOf("'", start);
                int quoteEnd = cause.indexOf("'", quoteStart + 1);
                if (quoteStart != -1 && quoteEnd > quoteStart) {
                    String value = cause.substring(quoteStart + 1, quoteEnd);
                    detailMessage = String.format("Value '%s' already exists.", value);
                } else {
                    detailMessage = "Duplicate value detected.";
                }
            }
        }

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        problem.setTitle("Data Integrity Violation");
        problem.setDetail(detailMessage);
        problem.setType(URI.create("https://api.example.com/errors/conflict"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(DisabledException.class)
    public ProblemDetail handleDisabledAccount(DisabledException ex) {
        ex.printStackTrace();

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.FORBIDDEN);
        problem.setTitle("Account Disabled");
        problem.setDetail("Your account has been disabled. Please verify before continue.");
        problem.setType(URI.create("https://api.example.com/errors/account-disabled"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            AuthorizationDeniedException ex, HttpServletRequest request) {
        ex.printStackTrace();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", "Access Denied");
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("detail", "You do not have permission to access this resource.");
        body.put("instance", request.getRequestURI());
        body.put("timestamp", Instant.now().toString());

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(InvalidGoogleTokenException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidGoogleToken(InvalidGoogleTokenException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "status", HttpStatus.UNAUTHORIZED.value(),
                "error", "Unauthorized",
                "message", ex.getMessage()));
    }

    @ExceptionHandler(GoogleUserCreationException.class)
    public ResponseEntity<Map<String, Object>> handleUserCreation(GoogleUserCreationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "timestamp", LocalDateTime.now(),
                "status", HttpStatus.BAD_REQUEST.value(),
                "error", "User Creation Failed",
                "message", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
        ex.printStackTrace();

        ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        problem.setTitle("Internal Server Error");
        problem.setDetail(ex.getMessage());
        problem.setType(URI.create(""));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
