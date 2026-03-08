<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use App\Entity\UserGroup;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/groups', name: 'api_groups_')]
class GroupController extends ApiController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $userRepository,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(#[CurrentUser] User $user): JsonResponse
    {
        $repo = $this->em->getRepository(UserGroup::class);
        $groups = $this->isAdmin($user)
            ? $repo->findAll()
            : $repo->findBy(['owner' => $user]);

        return $this->success(array_map(fn ($g) => $g->toArray(), $groups));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['name'])) {
            return $this->error('Group name is required.');
        }

        $group = new UserGroup();
        $group->setName((string) $data['name']);
        $group->setDescription(isset($data['description']) ? (string) $data['description'] : null);
        $group->setOwner($user);
        $group->addMember($user);

        $this->em->persist($group);
        $this->em->flush();

        return $this->success($group->toArray(), 201);
    }

    #[Route('/{id}', name: 'get', methods: ['GET'])]
    public function get(int $id, #[CurrentUser] User $user): JsonResponse
    {
        $group = $this->em->find(UserGroup::class, $id);

        if (!$group) {
            return $this->error('Group not found.', 404);
        }

        if (!$this->isAdmin($user) && $group->getOwner()->getId() !== $user->getId()) {
            return $this->error('Access denied.', 403);
        }

        return $this->success($group->toArray());
    }

    #[Route('/{id}', name: 'update', methods: ['PUT', 'PATCH'])]
    public function update(int $id, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $group = $this->em->find(UserGroup::class, $id);

        if (!$group) {
            return $this->error('Group not found.', 404);
        }

        if (!$this->isAdmin($user) && $group->getOwner()->getId() !== $user->getId()) {
            return $this->error('Access denied.', 403);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (isset($data['name'])) {
            $group->setName((string) $data['name']);
        }

        if (array_key_exists('description', $data)) {
            $group->setDescription(null !== $data['description'] ? (string) $data['description'] : null);
        }

        $this->em->flush();

        return $this->success($group->toArray());
    }

    #[Route('/{id}/members', name: 'add_member', methods: ['POST'])]
    public function addMember(int $id, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $group = $this->em->find(UserGroup::class, $id);

        if (!$group) {
            return $this->error('Group not found.', 404);
        }

        if (!$this->isAdmin($user) && $group->getOwner()->getId() !== $user->getId()) {
            return $this->error('Access denied.', 403);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $member = $this->userRepository->find($data['userId'] ?? 0);

        if (!$member) {
            return $this->error('User not found.', 404);
        }

        $group->addMember($member);
        $this->em->flush();

        return $this->success($group->toArray());
    }

    #[Route('/{id}/members/{userId}', name: 'remove_member', methods: ['DELETE'])]
    public function removeMember(int $id, int $userId, #[CurrentUser] User $user): JsonResponse
    {
        $group = $this->em->find(UserGroup::class, $id);

        if (!$group) {
            return $this->error('Group not found.', 404);
        }

        if (!$this->isAdmin($user) && $group->getOwner()->getId() !== $user->getId()) {
            return $this->error('Access denied.', 403);
        }

        $member = $this->userRepository->find($userId);

        if ($member) {
            $group->removeMember($member);
            $this->em->flush();
        }

        return $this->success($group->toArray());
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $id, #[CurrentUser] User $user): JsonResponse
    {
        $group = $this->em->find(UserGroup::class, $id);

        if (!$group) {
            return $this->error('Group not found.', 404);
        }

        if (!$this->isAdmin($user) && $group->getOwner()->getId() !== $user->getId()) {
            return $this->error('Access denied.', 403);
        }

        $this->em->remove($group);
        $this->em->flush();

        return $this->success(['message' => 'Group deleted.']);
    }

    private function isAdmin(User $user): bool
    {
        return in_array('ROLE_ADMIN', $user->getRoles(), true);
    }
}
