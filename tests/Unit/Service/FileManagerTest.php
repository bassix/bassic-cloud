<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\File;
use App\Entity\User;
use App\Repository\FileRepository;
use App\Service\FileManager;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\String\Slugger\AsciiSlugger;

class FileManagerTest extends TestCase
{
    private FileRepository&MockObject $fileRepository;
    private FileManager $fileManager;
    private string $uploadDir;

    protected function setUp(): void
    {
        $this->fileRepository = $this->createMock(FileRepository::class);
        $this->uploadDir = sys_get_temp_dir() . '/basscloud_test_' . uniqid();
        $this->fileManager = new FileManager(
            $this->fileRepository,
            new AsciiSlugger(),
            $this->uploadDir,
        );
    }

    protected function tearDown(): void
    {
        if (is_dir($this->uploadDir)) {
            $this->removeDirectory($this->uploadDir);
        }
    }

    public function testEnsureUploadDirectoryCreatesDirectory(): void
    {
        $this->assertDirectoryDoesNotExist($this->uploadDir);

        $this->fileManager->ensureUploadDirectory();

        $this->assertDirectoryExists($this->uploadDir);
    }

    public function testGetAbsolutePathReturnsCorrectPath(): void
    {
        $file = $this->createFileEntity('2026/03/test-abc123.jpg');

        $path = $this->fileManager->getAbsolutePath($file);

        $this->assertSame($this->uploadDir . '/2026/03/test-abc123.jpg', $path);
    }

    public function testDeleteRemovesFileFromDisk(): void
    {
        $this->fileManager->ensureUploadDirectory();

        $subdir = $this->uploadDir . '/2026/03';
        mkdir($subdir, 0755, true);
        $filePath = $subdir . '/test-abc123.jpg';
        file_put_contents($filePath, 'dummy content');

        $file = $this->createFileEntity('2026/03/test-abc123.jpg');

        $this->fileRepository->expects($this->once())->method('remove');

        $this->fileManager->delete($file);

        $this->assertFileDoesNotExist($filePath);
    }

    public function testRenameUpdatesOriginalName(): void
    {
        $file = $this->createFileEntity('2026/03/test.jpg');
        $file->setOriginalName('old-name.jpg');

        $this->fileRepository->expects($this->once())->method('save');

        $result = $this->fileManager->rename($file, 'new-name.jpg');

        $this->assertSame('new-name.jpg', $result->getOriginalName());
    }

    private function createFileEntity(string $storagePath): File
    {
        $user = new User();
        $user->setUsername('tester');
        $user->setEmail('tester@example.com');

        $file = new File();
        $file->setOwner($user);
        $file->setStoragePath($storagePath);
        $file->setOriginalName('test.jpg');
        $file->setMimeType('image/jpeg');
        $file->setSize('1024');

        return $file;
    }

    private function removeDirectory(string $dir): void
    {
        $items = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST,
        );

        foreach ($items as $item) {
            if ($item->isDir()) {
                rmdir($item->getPathname());
            } else {
                unlink($item->getPathname());
            }
        }

        rmdir($dir);
    }
}
