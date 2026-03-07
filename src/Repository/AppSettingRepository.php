<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\AppSetting;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AppSetting>
 */
class AppSettingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AppSetting::class);
    }

    public function get(string $key): ?string
    {
        $setting = $this->findOneBy(['settingKey' => $key]);

        return $setting?->getSettingValue();
    }

    public function set(string $key, ?string $value): void
    {
        $setting = $this->findOneBy(['settingKey' => $key]);

        if (null === $setting) {
            $setting = new AppSetting();
            $setting->setSettingKey($key);
        }

        $setting->setSettingValue($value);

        $em = $this->getEntityManager();
        $em->persist($setting);
        $em->flush();
    }

    public function isSetupComplete(): bool
    {
        return '1' === $this->get(AppSetting::SETUP_COMPLETE);
    }

    public function markSetupComplete(): void
    {
        $this->set(AppSetting::SETUP_COMPLETE, '1');
    }
}
