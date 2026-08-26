package com.hotelbooking.service;

import lombok.extern.slf4j.Slf4j;
import org.redisson.Redisson;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

/**
 * Real distributed lock using Redis via Redisson. Enable with {@code redisson.enabled=true}
 * (see application.yml {@code prod} profile) once you have a Redis instance and are
 * running multiple application nodes.
 *
 * This class also acts as a @Configuration so it can declare the RedissonClient bean
 * conditionally - avoiding any Redis connection attempt when redisson.enabled=false.
 */
@Configuration
@ConditionalOnProperty(prefix = "redisson", name = "enabled", havingValue = "true")
@Slf4j
public class RedissonLockService implements DistributedLockService {

    private static final long WAIT_TIME_SECONDS = 10;
    private static final long LEASE_TIME_SECONDS = 30;

    private final RedissonClient redissonClient;

    public RedissonLockService(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    @Bean
    @ConditionalOnProperty(prefix = "redisson", name = "enabled", havingValue = "true")
    public static RedissonClient redissonClient(
            @Value("${spring.data.redis.host:localhost}") String host,
            @Value("${spring.data.redis.port:6379}") int port) {
        Config config = new Config();
        config.useSingleServer().setAddress("redis://" + host + ":" + port);
        return Redisson.create(config);
    }

    @Override
    public <T> T runWithLock(String key, Callable<T> action) {
        RLock lock = redissonClient.getLock("booking-lock:" + key);
        boolean acquired = false;
        try {
            acquired = lock.tryLock(WAIT_TIME_SECONDS, LEASE_TIME_SECONDS, TimeUnit.SECONDS);
            if (!acquired) {
                throw new IllegalStateException("Could not acquire booking lock for " + key
                        + " - system is under heavy contention, please retry.");
            }
            return action.call();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while waiting for booking lock", e);
        } catch (Exception e) {
            if (e instanceof RuntimeException re) throw re;
            throw new RuntimeException(e);
        } finally {
            if (acquired && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
