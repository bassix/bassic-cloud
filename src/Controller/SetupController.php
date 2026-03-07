<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Repository\AppSettingRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Handles first-time setup: creating the initial admin account.
 * Gracefully handles missing database tables on first call.
 */
#[Route('/api/setup', name: 'api_setup_')]
class SetupController extends ApiController
{
    public function __construct(
        private readonly AppSettingRepository $settingRepository,
        private readonly UserRepository $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly ValidatorInterface $validator,
        private readonly EntityManagerInterface $entityManager,
    ) {
    }

    #[Route('/status', name: 'status', methods: ['GET'])]
    public function status(): JsonResponse
    {
        try {
            $isComplete = $this->settingRepository->isSetupComplete();
        } catch (\Throwable) {
            // Database or table doesn't exist yet — setup is not complete
            $isComplete = false;
        }

        return $this->success(['setupComplete' => $isComplete]);
    }

    #[Route('/init', name: 'init', methods: ['POST'])]
    public function init(Request $request): JsonResponse
    {
        // Ensure database schema exists before first use
        $this->ensureSchema();

        try {
            $setupComplete = $this->settingRepository->isSetupComplete();
        } catch (\Throwable) {
            $setupComplete = false;
        }

        if ($setupComplete) {
            return $this->error('Setup has already been completed.', 403);
        }

        $payload = json_decode($request->getContent(), true);

        $username = trim($payload['username'] ?? '');
        $email = trim($payload['email'] ?? '');
        $password = $payload['password'] ?? '';
        $locale = $payload['locale'] ?? 'en';

        if ('' === $username || '' === $email || '' === $password) {
            return $this->error('Username, email, and password are required.');
        }

        if (strlen($password) < 8) {
            return $this->error('Password must be at least 8 characters long.');
        }

        $admin = new User();
        $admin->setUsername($username);
        $admin->setEmail($email);
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setLocale($locale);

        $violations = $this->validator->validate($admin);

        if (count($violations) > 0) {
            $errors = [];

            foreach ($violations as $violation) {
                $errors[$violation->getPropertyPath()] = $violation->getMessage();
            }

            return $this->error('Validation failed.', 422, $errors);
        }

        $hashedPassword = $this->passwordHasher->hashPassword($admin, $password);
        $admin->setPassword($hashedPassword);

        $this->userRepository->save($admin, true);
        $this->settingRepository->markSetupComplete();

        return $this->success([
            'message' => 'Admin account created successfully.',
            'user'    => $admin->toArray(),
        ], 201);
    }

    /**
     * Automatically creates missing database tables using the Doctrine schema tool.
     * This enables first-run setup without requiring manual migration execution.
     */
    private function ensureSchema(): void
    {
        try {
            $schemaTool = new SchemaTool($this->entityManager);
            $metadata = $this->entityManager->getMetadataFactory()->getAllMetadata();

            if (empty($metadata)) {
                return;
            }

            $schemaTool->updateSchema($metadata);
        } catch (\Throwable) {
            // Silently fail — the init endpoint will catch specific errors later
        }
    }
}
