<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\FileRepository;
use App\Service\ThumbnailService;
use App\Service\ThumbnailTokenService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Serves thumbnails via a signed, time-limited URL — no JWT required.
 *
 * Route: GET /thumb/{width}x{height}/{token}
 *
 * The {token} encodes the file ID and an expiry timestamp, signed with APP_SECRET.
 * This lets <img> and <video> tags load previews without needing Authorization headers.
 *
 * Thumbnails are generated on demand and cached under var/thumbnails/.
 * When the source file changes, the cache is automatically regenerated.
 */
#[Route('/thumb', name: 'thumbnail_')]
class ThumbnailController extends AbstractController
{
    public function __construct(
        private readonly FileRepository $fileRepository,
        private readonly ThumbnailService $thumbnailService,
        private readonly ThumbnailTokenService $tokenService,
    ) {
    }

    /**
     * Serve (or generate) a thumbnail for an image file.
     *
     * @param string $dimensions  e.g. "360x360" or "800x600"
     * @param string $token       signed HMAC token containing file ID + expiry
     */
    #[Route(
        '/{dimensions}/{token}',
        name: 'serve',
        methods: ['GET'],
        requirements: ['dimensions' => '\d+x\d+', 'token' => '[A-Za-z0-9\-_.]+']
    )]
    public function serve(string $dimensions, string $token): Response
    {
        // Verify token and extract file ID.
        $fileId = $this->tokenService->verify($token);

        if (null === $fileId) {
            return new Response('Invalid or expired thumbnail token.', 403, ['Content-Type' => 'text/plain']);
        }

        $file = $this->fileRepository->find($fileId);

        if (null === $file) {
            return new Response('File not found.', 404, ['Content-Type' => 'text/plain']);
        }

        // Parse dimensions.
        [$w, $h] = array_map('intval', explode('x', $dimensions));

        if ($w <= 0 || $h <= 0) {
            return new Response('Invalid dimensions.', 400, ['Content-Type' => 'text/plain']);
        }

        // Non-image files: return a 204 so the browser shows nothing (img will use fallback).
        if (!$this->thumbnailService->isSupportedMime($file->getMimeType())) {
            return new Response('', 204);
        }

        try {
            $thumbPath = $this->thumbnailService->getThumbnailPath($file, $w, $h);
        } catch (\RuntimeException $e) {
            return new Response('Thumbnail generation failed: ' . $e->getMessage(), 500, ['Content-Type' => 'text/plain']);
        }

        $response = new BinaryFileResponse($thumbPath);
        $response->headers->set('Content-Type', 'image/jpeg');
        $response->setMaxAge(3600);
        $response->headers->set('Cache-Control', 'private, max-age=3600');

        return $response;
    }
}
