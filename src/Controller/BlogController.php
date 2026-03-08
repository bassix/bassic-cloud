<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\BlogPost;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\String\Slugger\AsciiSlugger;

#[Route('/api/blog', name: 'api_blog_')]
class BlogController extends ApiController
{
    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    /** Public: list published posts */
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(50, max(1, $request->query->getInt('limit', 10)));
        $repo = $this->em->getRepository(BlogPost::class);
        $qb = $repo->createQueryBuilder('p')
            ->where('p.status = :s')->setParameter('s', BlogPost::STATUS_PUBLISHED)
            ->orderBy('p.publishedAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        $posts = $qb->getQuery()->getResult();
        $total = (int) $repo->createQueryBuilder('p')
            ->select('COUNT(p.id)')
            ->where('p.status = :s')->setParameter('s', BlogPost::STATUS_PUBLISHED)
            ->getQuery()->getSingleScalarResult();

        return $this->paginated(array_map(fn ($p) => $p->toArray(), $posts), $total, $page, $limit);
    }

    /** Public: single published post by slug */
    #[Route('/{slug}', name: 'show', methods: ['GET'], requirements: ['slug' => '[a-z0-9-]+'])]
    public function show(string $slug): JsonResponse
    {
        $post = $this->em->getRepository(BlogPost::class)->findOneBy(['slug' => $slug, 'status' => BlogPost::STATUS_PUBLISHED]);

        if (!$post) {
            return $this->error('Post not found.', 404);
        }

        return $this->success($post->toArray(true));
    }

    /** Admin: list all posts */
    #[Route('/admin/posts', name: 'admin_list', methods: ['GET'])]
    public function adminList(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        if (!$this->isAdmin($user)) {
            return $this->error('Access denied.', 403);
        }

        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(100, max(1, $request->query->getInt('limit', 20)));
        $repo = $this->em->getRepository(BlogPost::class);
        $posts = $repo->createQueryBuilder('p')->orderBy('p.createdAt', 'DESC')
            ->setFirstResult(($page - 1) * $limit)->setMaxResults($limit)
            ->getQuery()->getResult();
        $total = (int) $repo->createQueryBuilder('p')->select('COUNT(p.id)')->getQuery()->getSingleScalarResult();

        return $this->paginated(array_map(fn ($p) => $p->toArray(), $posts), $total, $page, $limit);
    }

    /** Admin: create post */
    #[Route('/admin/posts', name: 'admin_create', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        if (!$this->isAdmin($user)) {
            return $this->error('Access denied.', 403);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['title'])) {
            return $this->error('Title is required.');
        }

        $post = new BlogPost();
        $post->setAuthor($user);
        $this->hydratePost($post, $data, $user);

        $this->em->persist($post);
        $this->em->flush();

        return $this->success($post->toArray(true), 201);
    }

    /** Admin: update post */
    #[Route('/admin/posts/{id}', name: 'admin_update', methods: ['PUT', 'PATCH'])]
    public function update(int $id, Request $request, #[CurrentUser] User $user): JsonResponse
    {
        if (!$this->isAdmin($user)) {
            return $this->error('Access denied.', 403);
        }

        $post = $this->em->find(BlogPost::class, $id);

        if (!$post) {
            return $this->error('Post not found.', 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $this->hydratePost($post, $data, $user);
        $this->em->flush();

        return $this->success($post->toArray(true));
    }

    /** Admin: delete post */
    #[Route('/admin/posts/{id}', name: 'admin_delete', methods: ['DELETE'])]
    public function delete(int $id, #[CurrentUser] User $user): JsonResponse
    {
        if (!$this->isAdmin($user)) {
            return $this->error('Access denied.', 403);
        }

        $post = $this->em->find(BlogPost::class, $id);

        if (!$post) {
            return $this->error('Post not found.', 404);
        }

        $this->em->remove($post);
        $this->em->flush();

        return $this->success(['message' => 'Post deleted.']);
    }

    private function hydratePost(BlogPost $post, array $data, User $user): void
    {
        if (isset($data['title'])) {
            $post->setTitle((string) $data['title']);
        }

        if (isset($data['subtitle'])) {
            $post->setSubtitle((string) $data['subtitle']);
        }

        if (isset($data['bodyContent'])) {
            $post->setBodyContent((string) $data['bodyContent']);
        }

        if (isset($data['slug']) && '' !== $data['slug']) {
            $post->setSlug((string) $data['slug']);
        } elseif ('' === $post->getSlug() && isset($data['title'])) {
            $slugger = new AsciiSlugger();
            $base = strtolower((string) $slugger->slug((string) $data['title']));
            $slug = $base;
            $i = 1;

            while (null !== $this->em->getRepository(BlogPost::class)->findOneBy(['slug' => $slug])) {
                $slug = $base . '-' . $i++;
            }

            $post->setSlug($slug);
        }

        if (isset($data['status'])) {
            $post->setStatus((string) $data['status']);
        }

        if (isset($data['tags']) && is_array($data['tags'])) {
            $post->setTags(array_values(array_map('strval', $data['tags'])));
        }

        if (isset($data['mediaFileIds']) && is_array($data['mediaFileIds'])) {
            $post->setMediaFileIds(array_values(array_map('intval', $data['mediaFileIds'])));
        }

        if (array_key_exists('coverFileId', $data)) {
            $post->setCoverFileId(null !== $data['coverFileId'] ? (int) $data['coverFileId'] : null);
        }

        if (isset($data['publishedAt']) && '' !== $data['publishedAt']) {
            $post->setPublishedAt(new \DateTimeImmutable((string) $data['publishedAt']));
        }

        try {
            $author = $post->getAuthor();
        } catch (\Error) {
            $author = null;
        }

        if (!$author instanceof User) {
            $post->setAuthor($user);
        }
    }

    private function isAdmin(User $user): bool
    {
        return in_array('ROLE_ADMIN', $user->getRoles(), true);
    }
}
