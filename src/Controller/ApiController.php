<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Base controller for all API endpoints providing shared helper methods.
 */
abstract class ApiController extends AbstractController
{
    protected function success(mixed $data = null, int $status = 200): JsonResponse
    {
        return $this->json(['success' => true, 'data' => $data], $status);
    }

    protected function error(string $message, int $status = 400, array $errors = []): JsonResponse
    {
        $payload = ['success' => false, 'message' => $message];

        if (!empty($errors)) {
            $payload['errors'] = $errors;
        }

        return $this->json($payload, $status);
    }

    protected function paginated(array $items, int $total, int $page, int $limit): JsonResponse
    {
        return $this->json([
            'success' => true,
            'data'    => $items,
            'meta'    => [
                'total' => $total,
                'page'  => $page,
                'limit' => $limit,
                'pages' => (int) ceil($total / max($limit, 1)),
            ],
        ]);
    }
}
