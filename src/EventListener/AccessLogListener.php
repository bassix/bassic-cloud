<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Entity\AccessLog;
use App\Entity\User;
use App\Repository\AccessLogRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

/**
 * Automatically logs API access on every request.
 * Login-specific events are handled separately by the AuthController.
 */
class AccessLogListener
{
    private const EXCLUDED_PREFIXES = [
        '/api/auth/login',
        '/api/setup',
    ];

    public function __construct(
        private readonly AccessLogRepository $logRepository,
        private readonly Security $security,
    ) {
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        $path = $request->getPathInfo();

        // Only track API requests, skip auth endpoints (logged separately)
        if (!str_starts_with($path, '/api/')) {
            return;
        }

        foreach (self::EXCLUDED_PREFIXES as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return;
            }
        }

        $user = $this->security->getUser();

        if (!$user instanceof User) {
            return;
        }

        $entry = new AccessLog();
        $entry->setAction(AccessLog::ACTION_PAGE_VIEW);
        $entry->setUser($user);
        $entry->setIp($request->getClientIp() ?? '0.0.0.0');
        $entry->setUserAgent(mb_substr($request->headers->get('User-Agent', ''), 0, 512));
        $entry->setDetail($request->getMethod() . ' ' . $path);

        $this->logRepository->save($entry, true);
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        // Reserved for future use (e.g., response time tracking)
    }
}
