<?php

declare(strict_types=1);

namespace App\Entity;

use App\Repository\AccessLogRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AccessLogRepository::class)]
#[ORM\Table(name: 'access_log')]
#[ORM\Index(columns: ['action'], name: 'idx_action')]
#[ORM\Index(columns: ['created_at'], name: 'idx_created_at')]
class AccessLog
{
    public const ACTION_LOGIN_SUCCESS = 'login_success';
    public const ACTION_LOGIN_FAIL = 'login_fail';
    public const ACTION_LOGOUT = 'logout';
    public const ACTION_PAGE_VIEW = 'page_view';
    public const ACTION_FILE_UPLOAD = 'file_upload';
    public const ACTION_FILE_DELETE = 'file_delete';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'accessLogs')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?User $user = null;

    #[ORM\Column(length: 45)]
    private string $ip = '';

    #[ORM\Column(length: 512, nullable: true)]
    private ?string $userAgent = null;

    #[ORM\Column(length: 30)]
    private string $action = '';

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $detail = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
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

    public function getUserAgent(): ?string
    {
        return $this->userAgent;
    }

    public function setUserAgent(?string $userAgent): static
    {
        $this->userAgent = $userAgent;

        return $this;
    }

    public function getAction(): string
    {
        return $this->action;
    }

    public function setAction(string $action): static
    {
        $this->action = $action;

        return $this;
    }

    public function getDetail(): ?string
    {
        return $this->detail;
    }

    public function setDetail(?string $detail): static
    {
        $this->detail = $detail;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function toArray(): array
    {
        return [
            'id'        => $this->id,
            'userId'    => $this->user?->getId(),
            'username'  => $this->user?->getUsername(),
            'ip'        => $this->ip,
            'userAgent' => $this->userAgent,
            'action'    => $this->action,
            'detail'    => $this->detail,
            'createdAt' => $this->createdAt->format('c'),
        ];
    }
}
