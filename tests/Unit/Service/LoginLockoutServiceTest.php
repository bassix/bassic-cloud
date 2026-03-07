<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\LoginAttempt;
use App\Repository\LoginAttemptRepository;
use App\Service\LoginLockoutService;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * Tests the Fibonacci-based login lockout logic.
 */
class LoginLockoutServiceTest extends TestCase
{
    private LoginAttemptRepository&MockObject $repository;
    private LoginLockoutService $service;

    protected function setUp(): void
    {
        $this->repository = $this->createMock(LoginAttemptRepository::class);
        $this->service = new LoginLockoutService($this->repository);
    }

    public function testCheckLockoutReturnsFalseWhenNoAttemptExists(): void
    {
        $this->repository->method('findByIpAndIdentifier')->willReturn(null);

        $result = $this->service->checkLockout('127.0.0.1', 'testuser');

        $this->assertFalse($result['locked']);
        $this->assertSame(0, $result['remainingSeconds']);
    }

    public function testCheckLockoutReturnsFalseWhenNotLocked(): void
    {
        $attempt = new LoginAttempt();
        $attempt->setIp('127.0.0.1');
        $attempt->setIdentifier('testuser');
        // No lockedUntil set, so not locked

        $this->repository->method('findByIpAndIdentifier')->willReturn($attempt);

        $result = $this->service->checkLockout('127.0.0.1', 'testuser');

        $this->assertFalse($result['locked']);
    }

    public function testCheckLockoutReturnsTrueWhenLocked(): void
    {
        $attempt = new LoginAttempt();
        $attempt->setIp('127.0.0.1');
        $attempt->setIdentifier('testuser');
        $attempt->setLockedUntil(new \DateTimeImmutable('+60 seconds'));

        $this->repository->method('findByIpAndIdentifier')->willReturn($attempt);

        $result = $this->service->checkLockout('127.0.0.1', 'testuser');

        $this->assertTrue($result['locked']);
        $this->assertGreaterThan(0, $result['remainingSeconds']);
    }

    public function testRecordFailedAttemptIncrementsCount(): void
    {
        $attempt = new LoginAttempt();
        $attempt->setIp('127.0.0.1');
        $attempt->setIdentifier('testuser');

        $this->repository->method('findOrCreate')->willReturn($attempt);
        $this->repository->expects($this->once())->method('save');

        $result = $this->service->recordFailedAttempt('127.0.0.1', 'testuser');

        $this->assertSame(1, $result->getAttemptCount());
        $this->assertNotNull($result->getLockedUntil());
    }

    /**
     * @dataProvider fibonacciDelayProvider
     */
    public function testFibonacciDelayProgression(int $attemptNumber, int $expectedMinDelay): void
    {
        $attempt = new LoginAttempt();
        $attempt->setIp('127.0.0.1');
        $attempt->setIdentifier('testuser');

        $this->repository->method('findOrCreate')->willReturn($attempt);
        $this->repository->method('save');

        // Simulate multiple failed attempts
        for ($i = 0; $i < $attemptNumber; $i++) {
            $this->service->recordFailedAttempt('127.0.0.1', 'testuser');
        }

        $remaining = $attempt->getRemainingLockSeconds();
        // Allow 2-second tolerance for test execution time
        $this->assertGreaterThanOrEqual($expectedMinDelay - 2, $remaining);
    }

    /**
     * @return array<string, array{int, int}>
     */
    public static function fibonacciDelayProvider(): array
    {
        return [
            '1st attempt → 1s'  => [1, 1],
            '2nd attempt → 1s'  => [2, 1],
            '3rd attempt → 2s'  => [3, 2],
            '4th attempt → 3s'  => [4, 3],
            '5th attempt → 5s'  => [5, 5],
            '6th attempt → 8s'  => [6, 8],
            '7th attempt → 13s' => [7, 13],
        ];
    }

    public function testClearAttemptsResetsCount(): void
    {
        $attempt = new LoginAttempt();
        $attempt->setIp('127.0.0.1');
        $attempt->setIdentifier('testuser');
        $attempt->incrementAttemptCount();
        $attempt->setLockedUntil(new \DateTimeImmutable('+60 seconds'));

        $this->repository->method('findByIpAndIdentifier')->willReturn($attempt);
        $this->repository->expects($this->once())->method('save');

        $this->service->clearAttempts('127.0.0.1', 'testuser');

        $this->assertSame(0, $attempt->getAttemptCount());
        $this->assertNull($attempt->getLockedUntil());
    }
}
