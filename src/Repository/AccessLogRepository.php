<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\AccessLog;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AccessLog>
 */
class AccessLogRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AccessLog::class);
    }

    public function save(AccessLog $log, bool $flush = false): void
    {
        $this->getEntityManager()->persist($log);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    /**
     * @return AccessLog[]
     */
    public function findPaginated(int $page = 1, int $limit = 50, ?string $action = null): array
    {
        $qb = $this->createQueryBuilder('l')
            ->leftJoin('l.user', 'u')
            ->addSelect('u')
            ->orderBy('l.createdAt', 'DESC');

        if (null !== $action) {
            $qb->andWhere('l.action = :action')
                ->setParameter('action', $action);
        }

        return $qb
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    public function countByAction(?string $action = null): int
    {
        $qb = $this->createQueryBuilder('l')
            ->select('COUNT(l.id)');

        if (null !== $action) {
            $qb->andWhere('l.action = :action')
                ->setParameter('action', $action);
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * Aggregate log entries per day for chart display.
     *
     * @return array<int, array{date: string, total: int, failed: int}>
     */
    public function getActivityChartData(int $days = 30): array
    {
        $since = new \DateTimeImmutable("-{$days} days");

        $conn = $this->getEntityManager()->getConnection();
        $sql = <<<SQL
            SELECT
                DATE(created_at) AS log_date,
                COUNT(*) AS total,
                SUM(CASE WHEN action = :fail THEN 1 ELSE 0 END) AS failed
            FROM access_log
            WHERE created_at >= :since
            GROUP BY log_date
            ORDER BY log_date ASC
        SQL;

        $rows = $conn->fetchAllAssociative($sql, [
            'fail'  => AccessLog::ACTION_LOGIN_FAIL,
            'since' => $since->format('Y-m-d'),
        ]);

        return array_map(static fn (array $row) => [
            'date'   => $row['log_date'],
            'total'  => (int) $row['total'],
            'failed' => (int) $row['failed'],
        ], $rows);
    }
}
