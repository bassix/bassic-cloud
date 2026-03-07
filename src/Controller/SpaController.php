<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Serves the Angular SPA for all non-API routes.
 * Priority is set low so API routes take precedence.
 */
class SpaController extends AbstractController
{
    #[Route('/{path}', name: 'spa_catchall', requirements: ['path' => '^(?!api/).*'], priority: -1000)]
    public function index(): Response
    {
        $projectDir = $this->getParameter('kernel.project_dir');

        // Primary build path: public/cloud/browser/index.html
        $indexPath = $projectDir . '/public/cloud/browser/index.html';

        // Fallback: legacy build paths kept for backwards compatibility
        if (!file_exists($indexPath)) {
            $legacyPaths = [
                $projectDir . '/public/cloud/index.html',
                $projectDir . '/public/app/browser/index.html',
                $projectDir . '/public/app/index.html',
                $projectDir . '/public/index.html',
            ];

            foreach ($legacyPaths as $path) {
                if (file_exists($path) && filesize($path) > 100) {
                    $indexPath = $path;

                    break;
                }
            }
        }

        if (!file_exists($indexPath)) {
            return new Response(
                '<h1>BassCloud</h1><p>Frontend not built yet. Run <code>cd frontend && ng build</code>.</p>',
                200,
                ['Content-Type' => 'text/html'],
            );
        }

        return new Response(
            file_get_contents($indexPath),
            200,
            ['Content-Type' => 'text/html'],
        );
    }
}
