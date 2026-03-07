<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    public function testDefaultRolesIncludesRoleUser(): void
    {
        $user = new User();
        $this->assertContains('ROLE_USER', $user->getRoles());
    }

    public function testSetRolesAddsRoleUserAutomatically(): void
    {
        $user = new User();
        $user->setRoles(['ROLE_ADMIN']);

        $roles = $user->getRoles();
        $this->assertContains('ROLE_ADMIN', $roles);
        $this->assertContains('ROLE_USER', $roles);
    }

    public function testToArrayReturnsExpectedKeys(): void
    {
        $user = new User();
        $user->setUsername('john');
        $user->setEmail('john@example.com');
        $user->setLocale('de');

        $data = $user->toArray();

        $this->assertSame('john', $data['username']);
        $this->assertSame('john@example.com', $data['email']);
        $this->assertSame('de', $data['locale']);
        $this->assertArrayHasKey('createdAt', $data);
        $this->assertArrayHasKey('updatedAt', $data);
    }

    public function testGetUserIdentifierReturnsUsername(): void
    {
        $user = new User();
        $user->setUsername('janedoe');

        $this->assertSame('janedoe', $user->getUserIdentifier());
    }
}
