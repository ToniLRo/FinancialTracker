package com.tonilr.FinancialTracker.exceptions;

public class SQLInjectionException extends RuntimeException {
    public SQLInjectionException(String message) {
        super(message);
    }
}
