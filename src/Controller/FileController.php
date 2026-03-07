<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Repository\FileRepository;
use App\Service\FileManager;
use App\Service\ThumbnailTokenService;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\Exception\IniSizeFileException;
use Symfony\Component\HttpFoundation\File\Exception\UploadException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

/**
 * File CRUD with upload (no size limit), download, and media filtering.
 */
#[Route('/api/files', name: 'api_files_')]
class FileController extends ApiController
{
    public function __construct(
        private readonly FileRepository $fileRepository,
        private readonly FileManager $fileManager,
        private readonly ThumbnailTokenService $thumbnailTokenService,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(200, max(1, $request->query->getInt('limit', 50)));
        $mime = $request->query->get('mime');
        $total = $this->fileRepository->countAll($mime);
        $files = $this->fileRepository->findPaginated($page, $limit, $mime);

        return $this->paginated(
            array_map(fn ($f) => $f->toArray(), $files),
            $total,
            $page,
            $limit,
        );
    }

    #[Route('/images', name: 'images', methods: ['GET'])]
    public function images(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(200, max(1, $request->query->getInt('limit', 50)));
        $total = $this->fileRepository->countAll('image/');
        $files = $this->fileRepository->findImages($page, $limit);

        return $this->paginated(
            array_map(fn ($f) => $f->toArray(), $files),
            $total,
            $page,
            $limit,
        );
    }

    #[Route('/videos', name: 'videos', methods: ['GET'])]
    public function videos(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(200, max(1, $request->query->getInt('limit', 50)));
        $total = $this->fileRepository->countAll('video/');
        $files = $this->fileRepository->findVideos($page, $limit);

        return $this->paginated(
            array_map(fn ($f) => $f->toArray(), $files),
            $total,
            $page,
            $limit,
        );
    }

    #[Route('/audio', name: 'audio', methods: ['GET'])]
    public function audio(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(200, max(1, $request->query->getInt('limit', 50)));
        $total = $this->fileRepository->countAll('audio/');
        $files = $this->fileRepository->findAudio($page, $limit);

        return $this->paginated(
            array_map(fn ($f) => $f->toArray(), $files),
            $total,
            $page,
            $limit,
        );
    }

    #[Route('', name: 'upload', methods: ['POST'])]
    public function upload(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        // Symfony validates the upload error code when accessing $request->files.
        // An IniSizeFileException is thrown here if UPLOAD_ERR_INI_SIZE is set,
        // which means upload_max_filesize / post_max_size in php.ini is too small.
        try {
            $uploadedFile = $request->files->get('file');
        } catch (IniSizeFileException $e) {
            return $this->error(
                'The file exceeds the server upload size limit. '
                . 'Please increase upload_max_filesize and post_max_size in php.ini, '
                . 'or ensure public/.user.ini is in place. '
                . '(' . $e->getMessage() . ')',
                413,
            );
        } catch (UploadException $e) {
            return $this->error('Upload error: ' . $e->getMessage(), 400);
        }

        if (null === $uploadedFile) {
            return $this->error('No file provided.');
        }

        // Extra guard: check PHP upload error code directly
        if (\UPLOAD_ERR_INI_SIZE === $uploadedFile->getError()
            || \UPLOAD_ERR_FORM_SIZE === $uploadedFile->getError()
        ) {
            return $this->error(
                'The file is too large. Increase upload_max_filesize in public/.user.ini.',
                413,
            );
        }

        if (\UPLOAD_ERR_OK !== $uploadedFile->getError()) {
            return $this->error(
                'Upload failed with PHP error code: ' . $uploadedFile->getError(),
                400,
            );
        }

        try {
            $this->fileManager->ensureUploadDirectory();
            $file = $this->fileManager->upload($uploadedFile, $user);
        } catch (\Exception $e) {
            return $this->error('Could not store file: ' . $e->getMessage(), 500);
        }

        return $this->success($file->toArray(), 201);
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $file = $this->fileRepository->find($id);

        if (null === $file) {
            return $this->error('File not found.', 404);
        }

        return $this->success($file->toArray());
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $file = $this->fileRepository->find($id);

        if (null === $file) {
            return $this->error('File not found.', 404);
        }

        $payload = json_decode($request->getContent(), true);

        if (isset($payload['originalName'])) {
            $this->fileManager->rename($file, $payload['originalName']);
        }

        return $this->success($file->toArray());
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function delete(int $id): JsonResponse
    {
        $file = $this->fileRepository->find($id);

        if (null === $file) {
            return $this->error('File not found.', 404);
        }

        $this->fileManager->delete($file);

        return $this->success(['message' => 'File deleted.']);
    }

    /**
     * Return a short-lived signed thumbnail URL for use in <img src>.
     * Width and height default to 360×360 (configurable via query params).
     */
    #[Route('/{id}/thumb-url', name: 'thumb_url', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function thumbUrl(int $id, Request $request): JsonResponse
    {
        $file = $this->fileRepository->find($id);

        if (null === $file) {
            return $this->error('File not found.', 404);
        }

        $w = max(1, min(2048, $request->query->getInt('w', 360)));
        $h = max(1, min(2048, $request->query->getInt('h', 360)));

        $token = $this->thumbnailTokenService->generate($id);
        $url = sprintf('/thumb/%dx%d/%s', $w, $h, $token);

        return $this->success(['url' => $url, 'w' => $w, 'h' => $h]);
    }

    #[Route('/{id}/download', name: 'download', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function download(int $id): BinaryFileResponse|JsonResponse
    {
        $file = $this->fileRepository->find($id);

        if (null === $file) {
            return $this->error('File not found.', 404);
        }

        $path = $this->fileManager->getAbsolutePath($file);

        if (!file_exists($path)) {
            return $this->error('File missing from storage.', 410);
        }

        $response = new BinaryFileResponse($path);
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $file->getOriginalName(),
        );

        return $response;
    }

    #[Route('/{id}/stream', name: 'stream', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function streamFile(int $id): BinaryFileResponse|JsonResponse
    {
        $file = $this->fileRepository->find($id);

        if (null === $file) {
            return $this->error('File not found.', 404);
        }

        $path = $this->fileManager->getAbsolutePath($file);

        if (!file_exists($path)) {
            return $this->error('File missing from storage.', 410);
        }

        $response = new BinaryFileResponse($path);
        $response->headers->set('Content-Type', $file->getMimeType());
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_INLINE,
            $file->getOriginalName(),
        );

        return $response;
    }
}
