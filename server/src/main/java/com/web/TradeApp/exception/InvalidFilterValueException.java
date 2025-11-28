package com.web.TradeApp.exception;

public class InvalidFilterValueException extends RuntimeException {
    public InvalidFilterValueException(String message, Throwable cause) {
        super(message, cause);
    }
}
