<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\DBAL\Types\Types;
use Doctrine\Migrations\AbstractMigration;

/**
 * Consolidated initial schema migration.
 *
 * Works with both SQLite (dev) and MariaDB (prod).
 */
final class Version20260309000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Consolidated initial schema: users, logs, files, groups, sharing, blog';
    }

    public function up(Schema $schema): void
    {
        // ── app_user ──────────────────────────────────────────────────────────
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

        // ── access_log ────────────────────────────────────────────────────────
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

        // ── login_attempt ─────────────────────────────────────────────────────
        $attempt = $schema->createTable('login_attempt');
        $attempt->addColumn('id', Types::INTEGER, ['autoincrement' => true]);
        $attempt->addColumn('ip', Types::STRING, ['length' => 45]);
        $attempt->addColumn('identifier', Types::STRING, ['length' => 180]);
        $attempt->addColumn('attempt_count', Types::INTEGER, ['default' => 0]);
        $attempt->addColumn('locked_until', Types::DATETIME_IMMUTABLE, ['notnull' => false]);
        $attempt->addColumn('last_attempt_at', Types::DATETIME_IMMUTABLE);
        $attempt->setPrimaryKey(['id']);
        $attempt->addUniqueIndex(['ip', 'identifier'], 'uniq_ip_identifier');

        // ── file ──────────────────────────────────────────────────────────────
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

        // ── app_setting ───────────────────────────────────────────────────────
        $setting = $schema->createTable('app_setting');
        $setting->addColumn('id', Types::INTEGER, ['autoincrement' => true]);
        $setting->addColumn('setting_key', Types::STRING, ['length' => 100]);
        $setting->addColumn('setting_value', Types::TEXT, ['notnull' => false]);
        $setting->setPrimaryKey(['id']);
        $setting->addUniqueIndex(['setting_key'], 'uniq_setting_key');

        // ── user_group ────────────────────────────────────────────────────────
        $group = $schema->createTable('user_group');
        $group->addColumn('id', Types::INTEGER, ['autoincrement' => true]);
        $group->addColumn('name', Types::STRING, ['length' => 120]);
        $group->addColumn('description', Types::STRING, ['length' => 512, 'notnull' => false]);
        $group->addColumn('owner_id', Types::INTEGER);
        $group->addColumn('created_at', Types::DATETIME_IMMUTABLE);
        $group->setPrimaryKey(['id']);
        $group->addForeignKeyConstraint('app_user', ['owner_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_group_owner');

        // ── user_group_member (many-to-many) ──────────────────────────────────
        $member = $schema->createTable('user_group_member');
        $member->addColumn('user_group_id', Types::INTEGER);
        $member->addColumn('user_id', Types::INTEGER);
        $member->setPrimaryKey(['user_group_id', 'user_id']);
        $member->addForeignKeyConstraint('user_group', ['user_group_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_ugm_group');
        $member->addForeignKeyConstraint('app_user', ['user_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_ugm_user');

        // ── file_share ────────────────────────────────────────────────────────
        $share = $schema->createTable('file_share');
        $share->addColumn('id', Types::INTEGER, ['autoincrement' => true]);
        $share->addColumn('file_id', Types::INTEGER);
        $share->addColumn('shared_with_id', Types::INTEGER, ['notnull' => false]);
        $share->addColumn('shared_with_group_id', Types::INTEGER, ['notnull' => false]);
        $share->addColumn('is_public', Types::BOOLEAN, ['default' => false]);
        $share->addColumn('public_token', Types::STRING, ['length' => 64]);
        $share->addColumn('expires_at', Types::DATETIME_IMMUTABLE, ['notnull' => false]);
        $share->addColumn('created_at', Types::DATETIME_IMMUTABLE);
        $share->setPrimaryKey(['id']);
        $share->addUniqueIndex(['public_token'], 'uniq_share_token');
        $share->addForeignKeyConstraint('file', ['file_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_share_file');
        $share->addForeignKeyConstraint('app_user', ['shared_with_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_share_user');
        $share->addForeignKeyConstraint('user_group', ['shared_with_group_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_share_group');

        // ── blog_post ─────────────────────────────────────────────────────────
        $blog = $schema->createTable('blog_post');
        $blog->addColumn('id', Types::INTEGER, ['autoincrement' => true]);
        $blog->addColumn('title', Types::STRING, ['length' => 255]);
        $blog->addColumn('subtitle', Types::STRING, ['length' => 512]);
        $blog->addColumn('body_content', Types::TEXT);
        $blog->addColumn('slug', Types::STRING, ['length' => 255]);
        $blog->addColumn('status', Types::STRING, ['length' => 20, 'default' => 'draft']);
        $blog->addColumn('author_id', Types::INTEGER);
        $blog->addColumn('published_at', Types::DATETIME_IMMUTABLE, ['notnull' => false]);
        $blog->addColumn('tags', Types::JSON);
        $blog->addColumn('media_file_ids', Types::JSON);
        $blog->addColumn('cover_file_id', Types::INTEGER, ['notnull' => false]);
        $blog->addColumn('created_at', Types::DATETIME_IMMUTABLE);
        $blog->addColumn('updated_at', Types::DATETIME_IMMUTABLE);
        $blog->setPrimaryKey(['id']);
        $blog->addUniqueIndex(['slug'], 'uniq_blog_slug');
        $blog->addIndex(['status'], 'idx_blog_status');
        $blog->addIndex(['published_at'], 'idx_blog_published');
        $blog->addForeignKeyConstraint('app_user', ['author_id'], ['id'], ['onDelete' => 'CASCADE'], 'fk_blog_author');
    }

    public function down(Schema $schema): void
    {
        // Drop in reverse dependency order
        $schema->dropTable('blog_post');
        $schema->dropTable('file_share');
        $schema->dropTable('user_group_member');
        $schema->dropTable('user_group');
        $schema->dropTable('app_setting');
        $schema->dropTable('file');
        $schema->dropTable('login_attempt');
        $schema->dropTable('access_log');
        $schema->dropTable('app_user');
    }
}
