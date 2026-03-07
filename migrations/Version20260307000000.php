<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Types\Types;
use Doctrine\Migrations\AbstractMigration;

/**
 * Initial schema using Doctrine Schema API for database-agnostic DDL.
 * Works with both SQLite (dev) and MariaDB (prod).
 */
final class Version20260307000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create initial schema: app_user, access_log, login_attempt, file, app_setting';
    }

    public function up(Schema $schema): void
    {
        // -- app_user --
        $user = $schema->createTable('app_user');
        $user->addColumn('id', Types::INTEGER, ['autoincrement' => true]);
        $user->addColumn('username', Types::STRING, ['length' => 80]);
        $user->addColumn('email', Types::STRING, ['length' => 180]);
        $user->addColumn('password', Types::STRING, ['length' => 255]);
        $user->addColumn('roles', Types::JSON);
        $user->addColumn('locale', Types::STRING, ['length' => 5, 'default' => 'en']);
        $user->addColumn('created_at', Types::DATETIME_IMMUTABLE);
        $user->addColumn('updated_at', Types::DATETIME_IMMUTABLE);
        $user->setPrimaryKey(['id']);
        $user->addUniqueIndex(['username'], 'uniq_user_username');
        $user->addUniqueIndex(['email'], 'uniq_user_email');

        // -- access_log --
        $log = $schema->createTable('access_log');
        $log->addColumn('id', Types::INTEGER, ['autoincrement' => true]);
        $log->addColumn('user_id', Types::INTEGER, ['notnull' => false]);
        $log->addColumn('ip', Types::STRING, ['length' => 45]);
        $log->addColumn('user_agent', Types::STRING, ['length' => 512, 'notnull' => false]);
        $log->addColumn('action', Types::STRING, ['length' => 30]);
        $log->addColumn('detail', Types::STRING, ['length' => 255, 'notnull' => false]);
        $log->addColumn('created_at', Types::DATETIME_IMMUTABLE);
        $log->setPrimaryKey(['id']);
        $log->addIndex(['user_id'], 'idx_access_log_user');
        $log->addIndex(['action'], 'idx_access_log_action');
        $log->addIndex(['created_at'], 'idx_access_log_created');
        $log->addForeignKeyConstraint('app_user', ['user_id'], ['id'], ['onDelete' => 'SET NULL'], 'fk_access_log_user');

        // -- login_attempt --
        $attempt = $schema->createTable('login_attempt');
        $attempt->addColumn('id', Types::INTEGER, ['autoincrement' => true]);
        $attempt->addColumn('ip', Types::STRING, ['length' => 45]);
        $attempt->addColumn('identifier', Types::STRING, ['length' => 180]);
        $attempt->addColumn('attempt_count', Types::INTEGER, ['default' => 0]);
        $attempt->addColumn('locked_until', Types::DATETIME_IMMUTABLE, ['notnull' => false]);
        $attempt->addColumn('last_attempt_at', Types::DATETIME_IMMUTABLE);
        $attempt->setPrimaryKey(['id']);
        $attempt->addUniqueIndex(['ip', 'identifier'], 'uniq_ip_identifier');

        // -- file --
        $file = $schema->createTable('file');
        $file->addColumn('id', Types::INTEGER, ['autoincrement' => true]);
        $file->addColumn('user_id', Types::INTEGER);
        $file->addColumn('original_name', Types::STRING, ['length' => 255]);
        $file->addColumn('storage_path', Types::STRING, ['length' => 512]);
        $file->addColumn('mime_type', Types::STRING, ['length' => 127]);
        $file->addColumn('size', Types::BIGINT);
        $file->addColumn('created_at', Types::DATETIME_IMMUTABLE);
        $file->addColumn('updated_at', Types::DATETIME_IMMUTABLE);
        $file->setPrimaryKey(['id']);
        $file->addIndex(['user_id'], 'idx_file_user');
        $file->addForeignKeyConstraint('app_user', ['user_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_file_user');

        // -- app_setting --
        $setting = $schema->createTable('app_setting');
        $setting->addColumn('id', Types::INTEGER, ['autoincrement' => true]);
        $setting->addColumn('setting_key', Types::STRING, ['length' => 100]);
        $setting->addColumn('setting_value', Types::TEXT, ['notnull' => false]);
        $setting->setPrimaryKey(['id']);
        $setting->addUniqueIndex(['setting_key'], 'uniq_setting_key');
    }

    public function down(Schema $schema): void
    {
        $schema->dropTable('access_log');
        $schema->dropTable('login_attempt');
        $schema->dropTable('file');
        $schema->dropTable('app_setting');
        $schema->dropTable('app_user');
    }
}
