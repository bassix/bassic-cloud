<?php

declare(strict_types=1);

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'blog_post')]
#[ORM\HasLifecycleCallbacks]
class BlogPost
{
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
    public const STATUS_ARCHIVED = 'archived';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $title = '';

    #[ORM\Column(length: 512)]
    private string $subtitle = '';

    #[ORM\Column(type: Types::TEXT)]
    private string $bodyContent = '';

    #[ORM\Column(length: 255, unique: true)]
    private string $slug = '';

    #[ORM\Column(length: 20, options: ['default' => 'draft'])]
    private string $status = self::STATUS_DRAFT;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $author;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $publishedAt = null;

    /** @var list<string> */
    #[ORM\Column(type: Types::JSON)]
    private array $tags = [];

    /** @var list<int> File IDs associated with this post */
    #[ORM\Column(type: Types::JSON)]
    private array $mediaFileIds = [];

    #[ORM\Column(nullable: true)]
    private ?int $coverFileId = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function touchUpdatedAt(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }
    public function getTitle(): string
    {
        return $this->title;
    }
    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }
    public function getSubtitle(): string
    {
        return $this->subtitle;
    }
    public function setSubtitle(string $subtitle): static
    {
        $this->subtitle = $subtitle;

        return $this;
    }
    public function getBodyContent(): string
    {
        return $this->bodyContent;
    }
    public function setBodyContent(string $bodyContent): static
    {
        $this->bodyContent = $bodyContent;

        return $this;
    }
    public function getSlug(): string
    {
        return $this->slug;
    }
    public function setSlug(string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }
    public function getStatus(): string
    {
        return $this->status;
    }
    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }
    public function getAuthor(): User
    {
        return $this->author;
    }
    public function setAuthor(User $author): static
    {
        $this->author = $author;

        return $this;
    }
    public function getPublishedAt(): ?\DateTimeImmutable
    {
        return $this->publishedAt;
    }
    public function setPublishedAt(?\DateTimeImmutable $publishedAt): static
    {
        $this->publishedAt = $publishedAt;

        return $this;
    }

    /** @return list<string> */
    public function getTags(): array
    {
        return $this->tags;
    }

    /** @param list<string> $tags */
    public function setTags(array $tags): static
    {
        $this->tags = $tags;

        return $this;
    }

    /** @return list<int> */
    public function getMediaFileIds(): array
    {
        return $this->mediaFileIds;
    }

    /** @param list<int> $ids */
    public function setMediaFileIds(array $ids): static
    {
        $this->mediaFileIds = $ids;

        return $this;
    }
    public function getCoverFileId(): ?int
    {
        return $this->coverFileId;
    }
    public function setCoverFileId(?int $id): static
    {
        $this->coverFileId = $id;

        return $this;
    }
    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }
    public function getUpdatedAt(): \DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function toArray(bool $full = false): array
    {
        $data = [
            'id'          => $this->id,
            'title'       => $this->title,
            'subtitle'    => $this->subtitle,
            'slug'        => $this->slug,
            'status'      => $this->status,
            'authorId'    => $this->author->getId(),
            'authorName'  => $this->author->getUsername(),
            'publishedAt' => $this->publishedAt?->format('c'),
            'tags'        => $this->tags,
            'coverFileId' => $this->coverFileId,
            'createdAt'   => $this->createdAt->format('c'),
            'updatedAt'   => $this->updatedAt->format('c'),
        ];

        if ($full) {
            $data['bodyContent'] = $this->bodyContent;
            $data['mediaFileIds'] = $this->mediaFileIds;
        }

        return $data;
    }
}
