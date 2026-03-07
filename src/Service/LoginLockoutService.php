<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\LoginAttempt;
use App\Repository\LoginAttemptRepository;

/**
 * Handles login lockout using Fibonacci-based delay progression.
 *
 * After each failed attempt, the lockout duration increases following
 * the Fibonacci sequence: 1s, 1s, 2s, 3s, 5s, 8s, 13s, 21s, ...
 */
class LoginLockoutService
{
    public function __construct(
        private readonly LoginAttemptRepository $attemptRepository,
    ) {
    }

    /**
     * Check if the given IP + identifier combination is currently locked.
     *
     * @return array{locked: bool, remainingSeconds: int}
     */
    public function checkLockout(string $ip, string $identifier): array
    {
        $attempt = $this->attemptRepository->findByIpAndIdentifier($ip, $identifier);

        if (null === $attempt || !$attempt->isLocked()) {
            return ['locked' => false, 'remainingSeconds' => 0];
        }

        return [
            'locked'           => true,
            'remainingSeconds' => $attempt->getRemainingLockSeconds(),
        ];
    }

    /**
     * Record a failed login attempt and calculate new lockout period.
     */
    public function recordFailedAttempt(string $ip, string $identifier): LoginAttempt
    {
        $attempt = $this->attemptRepository->findOrCreate($ip, $identifier);
        $attempt->incrementAttemptCount();

        $lockSeconds = $this->calculateFibonacciDelay($attempt->getAttemptCount());
        $lockedUntil = new \DateTimeImmutable("+{$lockSeconds} seconds");
        $attempt->setLockedUntil($lockedUntil);

        $this->attemptRepository->save($attempt, true);

        return $attempt;
    }

    /**
     * Clear lockout state after a successful login.
     */
    public function clearAttempts(string $ip, string $identifier): void
    {
        $attempt = $this->attemptRepository->findByIpAndIdentifier($ip, $identifier);

        if (null !== $attempt) {
            $attempt->resetAttemptCount();
            $this->attemptRepository->save($attempt, true);
        }
    }

    /**
     * Calculate lockout delay in seconds using the Fibonacci sequence.
     *
     * Position: 1  2  3  4  5  6   7   8   9   10  ...
     * Delay:    1  1  2  3  5  8  13  21  34  55  ...
     */
    private function calculateFibonacciDelay(int $attemptNumber): int
    {
        if ($attemptNumber <= 0) {
            return 0;
        }

        $a = 0;
        $b = 1;

        for ($i = 1; $i < $attemptNumber; $i++) {
            $next = $a + $b;
            $a = $b;
            $b = $next;
        }

        // Cap at 10 minutes maximum
        return min($b, 600);
    }
}
