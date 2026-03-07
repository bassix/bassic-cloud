<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * CRUD operations for user management. Admin access only.
 */
#[Route('/api/users', name: 'api_users_')]
class UserController extends ApiController
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher,
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(100, max(1, $request->query->getInt('limit', 20)));
        $total = $this->userRepository->countAll();
        $users = $this->userRepository->findPaginated($page, $limit);

        return $this->paginated(
            array_map(fn (User $u) => $u->toArray(), $users),
            $total,
            $page,
            $limit,
        );
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);

        if (null === $user) {
            return $this->error('User not found.', 404);
        }

        return $this->success($user->toArray());
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $payload = json_decode($request->getContent(), true);

        $user = new User();
        $user->setUsername(trim($payload['username'] ?? ''));
        $user->setEmail(trim($payload['email'] ?? ''));
        $user->setRoles($payload['roles'] ?? []);
        $user->setLocale($payload['locale'] ?? 'en');

        $password = $payload['password'] ?? '';

        if (strlen($password) < 8) {
            return $this->error('Password must be at least 8 characters long.');
        }

        $violations = $this->validator->validate($user);

        if (count($violations) > 0) {
            $errors = [];

            foreach ($violations as $v) {
                $errors[$v->getPropertyPath()] = $v->getMessage();
            }

            return $this->error('Validation failed.', 422, $errors);
        }

        if ($this->userRepository->findByUsername($user->getUsername())) {
            return $this->error('Username already exists.', 409);
        }

        if ($this->userRepository->findByEmail($user->getEmail())) {
            return $this->error('Email already exists.', 409);
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $password));
        $this->userRepository->save($user, true);

        return $this->success($user->toArray(), 201);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->userRepository->find($id);

        if (null === $user) {
            return $this->error('User not found.', 404);
        }

        $payload = json_decode($request->getContent(), true);

        if (isset($payload['username'])) {
            $existing = $this->userRepository->findByUsername($payload['username']);

            if (null !== $existing && $existing->getId() !== $user->getId()) {
                return $this->error('Username already exists.', 409);
            }
            $user->setUsername(trim($payload['username']));
        }

        if (isset($payload['email'])) {
            $existing = $this->userRepository->findByEmail($payload['email']);

            if (null !== $existing && $existing->getId() !== $user->getId()) {
                return $this->error('Email already exists.', 409);
            }
            $user->setEmail(trim($payload['email']));
        }

        if (isset($payload['roles'])) {
            $user->setRoles($payload['roles']);
        }

        if (isset($payload['locale'])) {
            $user->setLocale($payload['locale']);
        }

        if (!empty($payload['password'])) {
            if (strlen($payload['password']) < 8) {
                return $this->error('Password must be at least 8 characters long.');
            }
            $user->setPassword($this->passwordHasher->hashPassword($user, $payload['password']));
        }

        $violations = $this->validator->validate($user);

        if (count($violations) > 0) {
            $errors = [];

            foreach ($violations as $v) {
                $errors[$v->getPropertyPath()] = $v->getMessage();
            }

            return $this->error('Validation failed.', 422, $errors);
        }

        $user->touchUpdatedAt();
        $this->userRepository->save($user, true);

        return $this->success($user->toArray());
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);

        if (null === $user) {
            return $this->error('User not found.', 404);
        }

        $this->userRepository->remove($user, true);

        return $this->success(['message' => 'User deleted.']);
    }
}
