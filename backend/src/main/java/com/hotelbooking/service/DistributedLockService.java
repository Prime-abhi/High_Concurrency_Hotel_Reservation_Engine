package com.hotelbooking.service;

import java.util.concurrent.Callable;

/**
 * Abstraction over a distributed lock keyed by roomId. In a single-instance
 * deployment the database pessimistic lock (SELECT ... FOR UPDATE) is already
 * sufficient to serialize booking attempts. Once the application scales
 * horizontally across multiple JVM instances sitting behind a load balancer,
 * an application-level distributed lock (Redis/Redisson) gives an extra guard
 * that stops N instances from even opening N separate DB transactions for the
 * same room at the same instant, reducing contention and lock-wait time on
 * the database itself.
 */
public interface DistributedLockService {

    /**
     * Acquires a lock scoped to the given key, runs the supplied action while
     * holding it, then releases it - even if the action throws.
     */
    <T> T runWithLock(String key, Callable<T> action);
}
