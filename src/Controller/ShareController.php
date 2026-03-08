<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\File;
use App\Entity\FileShare;
use App\Entity\User;
use App\Entity\UserGroup;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/files/{fileId}/shares', name: 'api_shares_')]
class ShareController extends ApiController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $userRepository,
    ) {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(int $fileId, #[CurrentUser] User $user): JsonResponse
    {
        $file = $this->em->find(File::class, $fileId);

        if (!$file || ($file->getOwner()->getId() !== $user->getId() && !$this->isAdmin($user))) {
            return $this->error('Not found.', 404);
        }

        $shares = $this->em->getRepository(FileShare::class)->findBy(['file' => $file]);

        return $this->success(array_map(fn ($s) => $s->toArray(), $shares));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(int $fileId, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $file = $this->em->find(File::class, $fileId);

        if (!$file || ($file->getOwner()->getId() !== $user->getId() && !$this->isAdmin($user))) {
            return $this->error('Not found.', 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $share = new FileShare();
        $share->setFile($file);

        if (!empty($data['userId'])) {
            $target = $this->userRepository->find((int) $data['userId']);

            if (!$target) {
                return $this->error('Target user not found.', 404);
            }

            $share->setSharedWith($target);
        }

        if (!empty($data['groupId'])) {
            $group = $this->em->find(UserGroup::class, (int) $data['groupId']);

            if (!$group) {
                return $this->error('Group not found.', 404);
            }

            $share->setSharedWithGroup($group);
        }

        if (!empty($data['isPublic'])) {
            $share->setIsPublic(true);
        }

        if (!empty($data['expiresAt'])) {
            $share->setExpiresAt(new \DateTimeImmutable((string) $data['expiresAt']));
        }

        $this->em->persist($share);
        $this->em->flush();

        return $this->success($share->toArray(), 201);
    }

    #[Route('/{shareId}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $fileId, int $shareId, #[CurrentUser] User $user): JsonResponse
    {
        $share = $this->em->find(FileShare::class, $shareId);

        if (!$share || $share->getFile()->getId() !== $fileId) {
            return $this->error('Not found.', 404);
        }

        if ($share->getFile()->getOwner()->getId() !== $user->getId() && !$this->isAdmin($user)) {
            return $this->error('Access denied.', 403);
        }

        $this->em->remove($share);
        $this->em->flush();

        return $this->success(['message' => 'Share revoked.']);
    }

    private function isAdmin(User $user): bool
    {
        return in_array('ROLE_ADMIN', $user->getRoles(), true);
    }
}
