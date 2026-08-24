package com.hotelbooking.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.concurrent.Callable;

/**
 * Default lock implementation when Redis/Redisson isn't configured (e.g. local
 * demo with the H2 profile). It simply runs the action - concurrency safety in
 * this mode relies entirely on the database's pessimistic row lock in
 * BookingService, which is correct for a single application instance but not
 * sufficient once you run multiple instances against the same database without
 * a shared distributed lock in front of them.
 */
@Service
@ConditionalOnProperty(prefix = "redisson", name = "enabled", havingValue = "false", matchIfMissing = true)
public class NoOpLockService implements DistributedLockService {

    @Override
    public <T> T runWithLock(String key, Callable<T> action) {
        try {
            return action.call();
        } catch (Exception e) {
            if (e instanceof RuntimeException re) throw re;
            throw new RuntimeException(e);
        }
    }
}
