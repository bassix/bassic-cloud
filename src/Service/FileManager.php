<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\File;
use App\Entity\User;
use App\Repository\FileRepository;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

/**
 * Manages file uploads, storage, and deletion.
 * Files are organized in date-based subdirectories to avoid filesystem limits.
 */
class FileManager
{
    public function __construct(
        private readonly FileRepository $fileRepository,
        private readonly SluggerInterface $slugger,
        private readonly string $uploadDirectory,
    ) {
    }

    /**
     * Store an uploaded file and create its database record.
     */
    public function upload(UploadedFile $uploadedFile, User $owner): File
    {
        // Prefer the client-supplied extension; fall back to deriving one from the MIME type.
        // We intentionally avoid UploadedFile::guessExtension() because it calls getMimeType()
        // on the temp-file path, which can be empty or invalid on some SAPI configurations.
        $clientExtension = $uploadedFile->getClientOriginalExtension();
        $extension = '' !== $clientExtension
            ? $clientExtension
            : $this->extensionFromMime($uploadedFile->getClientMimeType() ?? 'application/octet-stream');

        $originalName = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
        $safeName = $this->slugger->slug($originalName);
        $dateFolder = date('Y/m');
        $uniqueName = $safeName . '-' . uniqid() . '.' . $extension;

        $targetDir = $this->uploadDirectory . '/' . $dateFolder;
        $uploadedFile->move($targetDir, $uniqueName);

        $storagePath = $dateFolder . '/' . $uniqueName;
        $mimeType = $uploadedFile->getClientMimeType() ?? 'application/octet-stream';

        $file = new File();
        $file->setOwner($owner);
        $file->setOriginalName($uploadedFile->getClientOriginalName());
        $file->setStoragePath($storagePath);
        $file->setMimeType($mimeType);
        $file->setSize((string) filesize($targetDir . '/' . $uniqueName));

        $this->fileRepository->save($file, true);

        return $file;
    }

    /**
     * Get the absolute filesystem path for a file entity.
     */
    public function getAbsolutePath(File $file): string
    {
        return $this->uploadDirectory . '/' . $file->getStoragePath();
    }

    /**
     * Delete a file from disk and database.
     */
    public function delete(File $file): void
    {
        $path = $this->getAbsolutePath($file);

        if (file_exists($path)) {
            unlink($path);
        }

        $this->fileRepository->remove($file, true);
    }

    /**
     * Rename a file's original display name (not the storage path).
     */
    public function rename(File $file, string $newName): File
    {
        $file->setOriginalName($newName);
        $this->fileRepository->save($file, true);

        return $file;
    }

    /**
     * Ensure the upload directory exists.
     */
    public function ensureUploadDirectory(): void
    {
        if (!is_dir($this->uploadDirectory)) {
            mkdir($this->uploadDirectory, 0755, true);
        }
    }

    /**
     * Derive a file extension from a MIME type string without filesystem access.
     */
    private function extensionFromMime(string $mime): string
    {
        $map = [
            'image/jpeg'      => 'jpg',
            'image/png'       => 'png',
            'image/gif'       => 'gif',
            'image/webp'      => 'webp',
            'image/svg+xml'   => 'svg',
            'video/mp4'       => 'mp4',
            'video/webm'      => 'webm',
            'video/ogg'       => 'ogv',
            'audio/mpeg'      => 'mp3',
            'audio/ogg'       => 'ogg',
            'audio/wav'       => 'wav',
            'audio/flac'      => 'flac',
            'application/pdf' => 'pdf',
            'application/zip' => 'zip',
            'text/plain'      => 'txt',
            'text/html'       => 'html',
            'text/csv'        => 'csv',
        ];

        return $map[$mime] ?? 'bin';
    }
}
