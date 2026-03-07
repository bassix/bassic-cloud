<?php

declare(strict_types=1);

namespace App\Service;

/**
 * Issues and verifies short-lived HMAC tokens for thumbnail URLs.
 *
 * Token format (URL-safe base64 of JSON):
 *   { "id": <fileId>, "exp": <unix timestamp> }
 * Signature: HMAC-SHA256(payload, appSecret), appended as hex.
 *
 * The full token string passed in the URL is: base64url(payload) . '.' . hex(sig)
 */
class ThumbnailTokenService
{
    /** Token lifetime in seconds. */
    private const TTL = 3600;

    public function __construct(private readonly string $appSecret)
    {
    }

    /**
     * Generate a signed token for the given file ID.
     */
    public function generate(int $fileId): string
    {
        $payload = json_encode([
            'id'  => $fileId,
            'exp' => time() + self::TTL,
        ]);

        $b64 = rtrim(strtr(base64_encode((string) $payload), '+/', '-_'), '=');
        $sig = hash_hmac('sha256', $b64, $this->appSecret);

        return $b64 . '.' . $sig;
    }

    /**
     * Verify the token and return the file ID, or null if invalid/expired.
     */
    public function verify(string $token): ?int
    {
        $parts = explode('.', $token, 2);

        if (2 !== \count($parts)) {
            return null;
        }

        [$b64, $sig] = $parts;

        $expected = hash_hmac('sha256', $b64, $this->appSecret);

        if (!hash_equals($expected, $sig)) {
            return null;
        }

        $json = base64_decode(strtr($b64, '-_', '+/') . '==');

        if (false === $json) {
            return null;
        }

        $data = json_decode($json, true);

        if (!\is_array($data) || !isset($data['id'], $data['exp'])) {
            return null;
        }

        if ($data['exp'] < time()) {
            return null;
        }

        return (int) $data['id'];
    }
}
