<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'file_share')]
#[ORM\HasLifecycleCallbacks]
class FileShare
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: File::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private File $file;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?User $sharedWith = null;

    #[ORM\ManyToOne(targetEntity: UserGroup::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?UserGroup $sharedWithGroup = null;

    #[ORM\Column]
    private bool $isPublic = false;

    #[ORM\Column(length: 64, unique: true)]
    private string $publicToken = '';

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $expiresAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->publicToken = bin2hex(random_bytes(32));
    }

    public function getId(): ?int
    {
        return $this->id;
    }
    public function getFile(): File
    {
        return $this->file;
    }
    public function setFile(File $file): static
    {
        $this->file = $file;

        return $this;
    }
    public function getSharedWith(): ?User
    {
        return $this->sharedWith;
    }
    public function setSharedWith(?User $user): static
    {
        $this->sharedWith = $user;

        return $this;
    }
    public function getSharedWithGroup(): ?UserGroup
    {
        return $this->sharedWithGroup;
    }
    public function setSharedWithGroup(?UserGroup $group): static
    {
        $this->sharedWithGroup = $group;

        return $this;
    }
    public function isPublic(): bool
    {
        return $this->isPublic;
    }
    public function setIsPublic(bool $isPublic): static
    {
        $this->isPublic = $isPublic;

        return $this;
    }
    public function getPublicToken(): string
    {
        return $this->publicToken;
    }
    public function getExpiresAt(): ?\DateTimeImmutable
    {
        return $this->expiresAt;
    }
    public function setExpiresAt(?\DateTimeImmutable $expiresAt): static
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }
    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function isExpired(): bool
    {
        return null !== $this->expiresAt && $this->expiresAt < new \DateTimeImmutable();
    }

    public function toArray(): array
    {
        return [
            'id'              => $this->id,
            'fileId'          => $this->file->getId(),
            'fileName'        => $this->file->getOriginalName(),
            'sharedWithId'    => $this->sharedWith?->getId(),
            'sharedWithName'  => $this->sharedWith?->getUsername(),
            'sharedWithGroup' => $this->sharedWithGroup?->getId(),
            'groupName'       => $this->sharedWithGroup?->getName(),
            'isPublic'        => $this->isPublic,
            'publicToken'     => $this->isPublic ? $this->publicToken : null,
            'expiresAt'       => $this->expiresAt?->format('c'),
            'createdAt'       => $this->createdAt->format('c'),
        ];
    }
}
