<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\File;

/**
 * Generates and caches image thumbnails using GD.
 *
 * Thumbnails are stored under var/thumbnails/{width}x{height}/{storagePath}.jpg
 * so they survive across requests. If the source file changes (same storage path
 * is re-used), the cache is invalidated by comparing mtime.
 */
class ThumbnailService
{
    /** Default JPEG quality for thumbnails (0-100). */
    private const JPEG_QUALITY = 85;

    /** Maximum allowed dimension to prevent abuse. */
    private const MAX_DIMENSION = 2048;

    public function __construct(
        private readonly string $uploadDirectory,
        private readonly string $thumbnailDirectory,
    ) {
    }

    /**
     * Return the absolute path to a thumbnail, generating it if necessary.
     *
     * @throws \RuntimeException when the source file cannot be processed
     */
    public function getThumbnailPath(File $file, int $width, int $height): string
    {
        $width = min($width, self::MAX_DIMENSION);
        $height = min($height, self::MAX_DIMENSION);

        $sourcePath = $this->uploadDirectory . '/' . $file->getStoragePath();

        if (!file_exists($sourcePath)) {
            throw new \RuntimeException('Source file not found: ' . $file->getStoragePath());
        }

        $thumbPath = $this->buildThumbPath($file->getStoragePath(), $width, $height);
        $thumbDir = \dirname($thumbPath);

        // Use cached thumbnail if it is newer than the source file.
        if (file_exists($thumbPath) && filemtime($thumbPath) >= filemtime($sourcePath)) {
            return $thumbPath;
        }

        if (!is_dir($thumbDir) && !mkdir($thumbDir, 0755, true) && !is_dir($thumbDir)) {
            throw new \RuntimeException('Cannot create thumbnail directory: ' . $thumbDir);
        }

        $this->generate($sourcePath, $thumbPath, $width, $height, $file->getMimeType());

        return $thumbPath;
    }

    /**
     * Build the filesystem path for a thumbnail without generating it.
     */
    public function buildThumbPath(string $storagePath, int $width, int $height): string
    {
        $safeBase = preg_replace('/\.[^.]+$/', '', $storagePath) ?? $storagePath;

        return sprintf(
            '%s/%dx%d/%s.jpg',
            rtrim($this->thumbnailDirectory, '/'),
            $width,
            $height,
            ltrim($safeBase, '/'),
        );
    }

    /**
     * Check whether GD can process the given MIME type.
     */
    public function isSupportedMime(string $mime): bool
    {
        return \in_array($mime, [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/bmp',
        ], true);
    }

    /**
     * Generate a thumbnail using GD and save it as JPEG.
     */
    private function generate(
        string $sourcePath,
        string $destPath,
        int $width,
        int $height,
        string $mimeType,
    ): void {
        $source = $this->loadImage($sourcePath, $mimeType);

        $srcW = imagesx($source);
        $srcH = imagesy($source);

        // Calculate dimensions preserving aspect ratio (cover / crop strategy).
        [$dstW, $dstH, $srcX, $srcY, $srcCropW, $srcCropH] = $this->cropDimensions(
            $srcW,
            $srcH,
            $width,
            $height,
        );

        $thumb = imagecreatetruecolor($dstW, $dstH);

        if (false === $thumb) {
            throw new \RuntimeException('imagecreatetruecolor() failed.');
        }

        // Preserve transparency for PNG sources.
        $bg = imagecolorallocate($thumb, 255, 255, 255);

        if (false !== $bg) {
            imagefill($thumb, 0, 0, $bg);
        }

        imagecopyresampled(
            $thumb,
            $source,
            0,
            0,
            $srcX,
            $srcY,
            $dstW,
            $dstH,
            $srcCropW,
            $srcCropH,
        );

        imagejpeg($thumb, $destPath, self::JPEG_QUALITY);

        imagedestroy($source);
        imagedestroy($thumb);
    }

    /**
     * Load a GD image resource from disk.
     *
     */
    private function loadImage(string $path, string $mimeType): \GdImage
    {
        $image = match (true) {
            \in_array($mimeType, ['image/jpeg', 'image/jpg'], true) => imagecreatefromjpeg($path),
            'image/png' === $mimeType                               => imagecreatefrompng($path),
            'image/gif' === $mimeType                               => imagecreatefromgif($path),
            'image/webp' === $mimeType                              => imagecreatefromwebp($path),
            'image/bmp' === $mimeType                               => imagecreatefrombmp($path),
            default                                                 => imagecreatefromjpeg($path),
        };

        if (false === $image) {
            throw new \RuntimeException('GD could not load image: ' . $path);
        }

        return $image;
    }

    /**
     * Calculate crop/resize parameters so the thumbnail fills the target dimensions (cover).
     *
     * @return array{int, int, int, int, int, int} [dstW, dstH, srcX, srcY, srcCropW, srcCropH]
     */
    private function cropDimensions(int $srcW, int $srcH, int $targetW, int $targetH): array
    {
        $srcAspect = $srcW / $srcH;
        $dstAspect = $targetW / $targetH;

        if ($srcAspect > $dstAspect) {
            // Source is wider — crop horizontally.
            $srcCropH = $srcH;
            $srcCropW = (int) round($srcH * $dstAspect);
            $srcX = (int) round(($srcW - $srcCropW) / 2);
            $srcY = 0;
        } else {
            // Source is taller — crop vertically.
            $srcCropW = $srcW;
            $srcCropH = (int) round($srcW / $dstAspect);
            $srcX = 0;
            $srcY = (int) round(($srcH - $srcCropH) / 2);
        }

        return [$targetW, $targetH, $srcX, $srcY, $srcCropW, $srcCropH];
    }
}
