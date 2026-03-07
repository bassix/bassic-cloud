<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\File;
use App\Entity\User;
use PHPUnit\Framework\TestCase;

class FileTest extends TestCase
{
    public function testIsImageReturnsTrueForImageMimeTypes(): void
    {
        $file = $this->createFile('image/jpeg');
        $this->assertTrue($file->isImage());
        $this->assertFalse($file->isVideo());
        $this->assertFalse($file->isAudio());
    }

    public function testIsVideoReturnsTrueForVideoMimeTypes(): void
    {
        $file = $this->createFile('video/mp4');
        $this->assertFalse($file->isImage());
        $this->assertTrue($file->isVideo());
        $this->assertFalse($file->isAudio());
    }

    public function testIsAudioReturnsTrueForAudioMimeTypes(): void
    {
        $file = $this->createFile('audio/mpeg');
        $this->assertFalse($file->isImage());
        $this->assertFalse($file->isVideo());
        $this->assertTrue($file->isAudio());
    }

    public function testToArrayContainsExpectedKeys(): void
    {
        $file = $this->createFile('image/png');
        $file->setOriginalName('photo.png');
        $file->setSize('2048');

        $data = $file->toArray();

        $this->assertSame('photo.png', $data['originalName']);
        $this->assertSame('image/png', $data['mimeType']);
        $this->assertSame('2048', $data['size']);
        $this->assertTrue($data['isImage']);
    }

    private function createFile(string $mimeType): File
    {
        $user = new User();
        $user->setUsername('tester');
        $user->setEmail('test@example.com');

        $file = new File();
        $file->setOwner($user);
        $file->setMimeType($mimeType);
        $file->setStoragePath('2026/03/test.bin');

        return $file;
    }
}
