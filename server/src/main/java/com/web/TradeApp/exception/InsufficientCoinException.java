package com.web.TradeApp.exception;

public class InsufficientCoinException extends RuntimeException {
    public InsufficientCoinException(String message) {
        super(message);
    }
}
