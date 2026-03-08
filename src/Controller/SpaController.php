<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Serves the Angular SPA for all non-API routes.
 *
 * Static assets (JS, CSS, images) are served directly from public/spa/browser/.
 * All other routes return the SPA's index.html and let Angular handle routing.
 */
class SpaController extends AbstractController
{
    /** Extension → MIME type map for SPA assets (PHP's finfo is unreliable for .js on macOS). */
    private const MIME_TYPES = [
        'js'    => 'application/javascript',
        'css'   => 'text/css',
        'map'   => 'application/json',
        'json'  => 'application/json',
        'ico'   => 'image/x-icon',
        'svg'   => 'image/svg+xml',
        'png'   => 'image/png',
        'jpg'   => 'image/jpeg',
        'webp'  => 'image/webp',
        'woff'  => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf'   => 'font/ttf',
        'eot'   => 'application/vnd.ms-fontobject',
        'txt'   => 'text/plain',
    ];

    /**
     * Serves static SPA assets (JS chunks, CSS, source maps, favicon, etc.)
     * These files are produced by `ng build` into public/spa/browser/.
     */
    #[Route('/{file}', name: 'spa_asset', requirements: ['file' => '.+\.(js|css|map|ico|woff2?|ttf|eot|svg|png|jpg|webp|json|txt)$'], priority: -500)]
    public function asset(string $file): Response
    {
        $projectDir = $this->getParameter('kernel.project_dir');
        $assetPath = $projectDir . '/public/spa/browser/' . $file;

        if (!file_exists($assetPath)) {
            throw new NotFoundHttpException();
        }

        $response = new BinaryFileResponse($assetPath);
        $response->headers->set('Cache-Control', 'public, max-age=31536000, immutable');

        // Set correct Content-Type based on file extension
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

        if (isset(self::MIME_TYPES[$ext])) {
            $response->headers->set('Content-Type', self::MIME_TYPES[$ext]);
        }

        return $response;
    }

    /**
     * SPA catch-all: returns index.html for Angular client-side routing.
     */
    #[Route('/{path}', name: 'spa_catchall', requirements: ['path' => '^(?!api/|thumb/).*'], priority: -1000)]
    public function index(): Response
    {
        $projectDir = $this->getParameter('kernel.project_dir');
        $indexPath = $projectDir . '/public/spa/browser/index.html';

        if (!file_exists($indexPath)) {
            return new Response(
                '<h1>BassCloud</h1><p>Frontend not built. Run: <code>cd frontend && yarn ng build</code></p>',
                200,
                ['Content-Type' => 'text/html'],
            );
        }

        return new Response(
            file_get_contents($indexPath),
            200,
            ['Content-Type' => 'text/html; charset=UTF-8'],
        );
    }
}
