<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\LoginAttempt;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<LoginAttempt>
 */
class LoginAttemptRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, LoginAttempt::class);
    }

    public function save(LoginAttempt $attempt, bool $flush = false): void
    {
        $this->getEntityManager()->persist($attempt);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findByIpAndIdentifier(string $ip, string $identifier): ?LoginAttempt
    {
        return $this->findOneBy(['ip' => $ip, 'identifier' => $identifier]);
    }

    public function findOrCreate(string $ip, string $identifier): LoginAttempt
    {
        $attempt = $this->findByIpAndIdentifier($ip, $identifier);

        if (null === $attempt) {
            $attempt = new LoginAttempt();
            $attempt->setIp($ip);
            $attempt->setIdentifier($identifier);
        }

        return $attempt;
    }

    /**
     * Clean up old attempts older than given days.
     */
    public function purgeOlderThan(int $days = 30): int
    {
        $threshold = new \DateTimeImmutable("-{$days} days");

        return (int) $this->createQueryBuilder('la')
            ->delete()
            ->where('la.lastAttemptAt < :threshold')
            ->setParameter('threshold', $threshold)
            ->getQuery()
            ->execute();
    }
}
