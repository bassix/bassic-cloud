<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\AccessLog;
use App\Repository\AccessLogRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Provides access and failed-login logs with chart aggregation data.
 */
#[Route('/api/logs', name: 'api_logs_')]
class LogController extends ApiController
{
    public function __construct(
        private readonly AccessLogRepository $logRepository,
    ) {
    }

    #[Route('/access', name: 'access', methods: ['GET'])]
    public function access(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(200, max(1, $request->query->getInt('limit', 50)));
        $total = $this->logRepository->countByAction();
        $logs = $this->logRepository->findPaginated($page, $limit);

        return $this->paginated(
            array_map(fn (AccessLog $l) => $l->toArray(), $logs),
            $total,
            $page,
            $limit,
        );
    }

    #[Route('/failed', name: 'failed', methods: ['GET'])]
    public function failed(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(200, max(1, $request->query->getInt('limit', 50)));
        $total = $this->logRepository->countByAction(AccessLog::ACTION_LOGIN_FAIL);
        $logs = $this->logRepository->findPaginated($page, $limit, AccessLog::ACTION_LOGIN_FAIL);

        return $this->paginated(
            array_map(fn (AccessLog $l) => $l->toArray(), $logs),
            $total,
            $page,
            $limit,
        );
    }

    #[Route('/chart-data', name: 'chart_data', methods: ['GET'])]
    public function chartData(Request $request): JsonResponse
    {
        $days = min(365, max(7, $request->query->getInt('days', 30)));

        return $this->success($this->logRepository->getActivityChartData($days));
    }
}
