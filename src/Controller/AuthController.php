<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\AccessLogService;
use App\Service\LoginLockoutService;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

/**
 * Authentication controller with JWT token management
 * and Fibonacci-based login lockout protection.
 */
#[Route('/api/auth', name: 'api_auth_')]
class AuthController extends ApiController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly LoginLockoutService $lockoutService,
        private readonly AccessLogService $accessLogService,
    ) {
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);
        $identifier = trim($payload['username'] ?? '');
        $password = $payload['password'] ?? '';
        $clientIp = $request->getClientIp() ?? '0.0.0.0';

        if ('' === $identifier || '' === $password) {
            return $this->error('Username and password are required.');
        }

        // Check if this IP + identifier is locked out
        $lockout = $this->lockoutService->checkLockout($clientIp, $identifier);

        if ($lockout['locked']) {
            $this->accessLogService->logLoginFail($request, $identifier);

            return $this->error(
                'Too many failed attempts. Please wait before trying again.',
                429,
                ['retryAfter' => $lockout['remainingSeconds']],
            );
        }

        // Try to find the user by username or email
        $user = $this->userRepository->findByUsername($identifier)
            ?? $this->userRepository->findByEmail($identifier);

        if (null === $user || !$this->passwordHasher->isPasswordValid($user, $password)) {
            $attempt = $this->lockoutService->recordFailedAttempt($clientIp, $identifier);
            $this->accessLogService->logLoginFail($request, $identifier);

            return $this->error(
                'Invalid credentials.',
                401,
                ['retryAfter' => $attempt->getRemainingLockSeconds()],
            );
        }

        // Successful login — clear lockout and generate token
        $this->lockoutService->clearAttempts($clientIp, $identifier);
        $this->accessLogService->logLoginSuccess($user, $request);

        $token = $this->jwtManager->create($user);

        return $this->success([
            'token' => $token,
            'user'  => $user->toArray(),
        ]);
    }

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(#[CurrentUser] User $user): JsonResponse
    {
        return $this->success($user->toArray());
    }

    #[Route('/logout', name: 'logout', methods: ['POST'])]
    public function logout(#[CurrentUser] User $user, Request $request): JsonResponse
    {
        $this->accessLogService->logLogout($user, $request);

        return $this->success(['message' => 'Logged out successfully.']);
    }
}
