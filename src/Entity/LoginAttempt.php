<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\LoginAttemptRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LoginAttemptRepository::class)]
#[ORM\Table(name: 'login_attempt')]
#[ORM\UniqueConstraint(name: 'uniq_ip_identifier', columns: ['ip', 'identifier'])]
class LoginAttempt
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 45)]
    private string $ip = '';

    #[ORM\Column(length: 180)]
    private string $identifier = '';

    #[ORM\Column(type: Types::INTEGER, options: ['default' => 0])]
    private int $attemptCount = 0;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $lockedUntil = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $lastAttemptAt;

    public function __construct()
    {
        $this->lastAttemptAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getIp(): string
    {
        return $this->ip;
    }

    public function setIp(string $ip): static
    {
        $this->ip = $ip;

        return $this;
    }

    public function getIdentifier(): string
    {
        return $this->identifier;
    }

    public function setIdentifier(string $identifier): static
    {
        $this->identifier = $identifier;

        return $this;
    }

    public function getAttemptCount(): int
    {
        return $this->attemptCount;
    }

    public function incrementAttemptCount(): static
    {
        $this->attemptCount++;
        $this->lastAttemptAt = new \DateTimeImmutable();

        return $this;
    }

    public function resetAttemptCount(): static
    {
        $this->attemptCount = 0;
        $this->lockedUntil = null;

        return $this;
    }

    public function getLockedUntil(): ?\DateTimeImmutable
    {
        return $this->lockedUntil;
    }

    public function setLockedUntil(?\DateTimeImmutable $lockedUntil): static
    {
        $this->lockedUntil = $lockedUntil;

        return $this;
    }

    public function isLocked(): bool
    {
        if (null === $this->lockedUntil) {
            return false;
        }

        return $this->lockedUntil > new \DateTimeImmutable();
    }

    public function getLastAttemptAt(): \DateTimeImmutable
    {
        return $this->lastAttemptAt;
    }

    public function getRemainingLockSeconds(): int
    {
        if (!$this->isLocked()) {
            return 0;
        }

        return $this->lockedUntil->getTimestamp() - time();
    }
}
