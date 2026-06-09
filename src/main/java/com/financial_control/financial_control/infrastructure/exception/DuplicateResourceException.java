package com.financial_control.financial_control.infrastructure.exception;

/**
 * Exceção lançada quando há tentativa de criar um recurso que já existe.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
