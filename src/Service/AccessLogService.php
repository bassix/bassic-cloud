<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\AccessLog;
use App\Entity\User;
use App\Repository\AccessLogRepository;
use Symfony\Component\HttpFoundation\Request;

/**
 * Centralized service for recording access log events.
 */
class AccessLogService
{
    public function __construct(
        private readonly AccessLogRepository $logRepository,
    ) {
    }

    public function log(
        string $action,
        ?User $user = null,
        ?Request $request = null,
        ?string $detail = null,
    ): AccessLog {
        $entry = new AccessLog();
        $entry->setAction($action);
        $entry->setUser($user);
        $entry->setDetail($detail);

        if (null !== $request) {
            $entry->setIp($request->getClientIp() ?? '0.0.0.0');
            $entry->setUserAgent(mb_substr($request->headers->get('User-Agent', ''), 0, 512));
        }

        $this->logRepository->save($entry, true);

        return $entry;
    }

    public function logLoginSuccess(User $user, Request $request): AccessLog
    {
        return $this->log(AccessLog::ACTION_LOGIN_SUCCESS, $user, $request);
    }

    public function logLoginFail(Request $request, string $identifier): AccessLog
    {
        return $this->log(AccessLog::ACTION_LOGIN_FAIL, null, $request, "Identifier: {$identifier}");
    }

    public function logLogout(User $user, Request $request): AccessLog
    {
        return $this->log(AccessLog::ACTION_LOGOUT, $user, $request);
    }
}
