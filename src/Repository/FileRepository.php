<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\File;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<File>
 */
class FileRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, File::class);
    }

    public function save(File $file, bool $flush = false): void
    {
        $this->getEntityManager()->persist($file);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(File $file, bool $flush = false): void
    {
        $this->getEntityManager()->remove($file);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @return File[]
     */
    public function findPaginated(int $page = 1, int $limit = 50, ?string $mimeFilter = null): array
    {
        $qb = $this->createQueryBuilder('f')
            ->join('f.owner', 'u')
            ->addSelect('u')
            ->orderBy('f.createdAt', 'DESC');

        if (null !== $mimeFilter) {
            $qb->andWhere('f.mimeType LIKE :mime')
                ->setParameter('mime', $mimeFilter . '%');
        }

        return $qb
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function countAll(?string $mimeFilter = null): int
    {
        $qb = $this->createQueryBuilder('f')
            ->select('COUNT(f.id)');

        if (null !== $mimeFilter) {
            $qb->andWhere('f.mimeType LIKE :mime')
                ->setParameter('mime', $mimeFilter . '%');
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @return File[]
     */
    public function findImages(int $page = 1, int $limit = 50): array
    {
        return $this->findPaginated($page, $limit, 'image/');
    }

    /**
     * @return File[]
     */
    public function findVideos(int $page = 1, int $limit = 50): array
    {
        return $this->findPaginated($page, $limit, 'video/');
    }

    /**
     * @return File[]
     */
    public function findAudio(int $page = 1, int $limit = 50): array
    {
        return $this->findPaginated($page, $limit, 'audio/');
    }
}
