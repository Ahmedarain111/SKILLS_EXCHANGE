# Skills Exchange Platform

## Overview
A Django-based web application for users to exchange skills with each other. Users can create profiles, list skills they can offer and skills they want to learn, browse the marketplace, and initiate skill exchanges.

## Project Structure
- **Skills_Exchange/** - Main Django project directory
  - **main/** - Main Django app containing models, views, and templates
  - **Skills_Exchange/** - Django project settings and configuration
  - **db.sqlite3** - SQLite database (existing)
  - **manage.py** - Django management script
  - **certifications/** - User certification uploads

## Technology Stack
- Python (Django 5.2.6)
- SQLite database
- HTML/CSS/JavaScript frontend
- Django templating engine

## Key Features
- User authentication (signup/login/logout)
- User profiles with bio, location, certifications
- Skill marketplace with filtering by category and proficiency level
- Skill exchange management
- Admin dashboard for managing users and exchanges

## Recent Changes
- 2025-10-29: Bug Fixes and Performance Improvements
  - **Critical Bug Fix**: Fixed start_exchange view using incorrect field name (skill_type → role)
  - **UI Fix**: Fixed broken "Edit Profile" link in dashboard quick actions
  - **Performance Optimization**: Added database indexes on frequently queried fields:
    - UserSkill: role, proficiency, user+role composite
    - Exchange: status, user1+status, user2+status, start_date
    - Message: timestamp, is_read, receiver+is_read, sender+receiver
  - **Cache Control**: Added NoCacheMiddleware to prevent browser caching of dynamic content
  - **Code Quality**: Verified start_exchange is unused; propose_exchange_view is the active implementation

- 2025-10-29: My Exchanges Page
  - **New Page**: Created dedicated exchanges page at /exchanges/
  - **Organized View**: Exchanges grouped by status (pending, active, completed, other)
  - **Quick Actions**: Accept/reject pending requests, message active partners
  - **Navigation**: Added "My Exchanges" links to header and dashboard
  - **Smart Labels**: Clear display of skill offerings from each user's perspective

- 2025-10-29: Admin Dashboard Enhancements
  - **Real Statistics**: Fixed admin_dashboard to display actual exchange counts (active, pending, completed) instead of hardcoded zeros
  - **User Management**: Added complete CRUD operations for users (view, delete, toggle admin status)
  - **Enhanced Search**: Admin user search now includes username, email, and first name
  - **Exchange Filtering**: Added status-based filtering (all, active, pending, dispute, completed, cancelled)
  - **Security Hardening**: Added @require_POST decorators to admin_delete_user and admin_toggle_staff to prevent CSRF attacks
  - **Template Improvements**: Rebuilt admin_users.html with functional buttons and admin_exchanges.html with working filters
  - **Safety Checks**: Prevents admins from deleting or modifying their own accounts

- 2025-10-29: Initial import and Replit environment setup
  - Installed Python 3.11 with Django 5.2.7, Pillow, and Gunicorn
  - Configured Django settings for Replit environment (ALLOWED_HOSTS, CSRF_TRUSTED_ORIGINS)
  - Fixed duplicate DIRS in TEMPLATES configuration
  - Added media file serving configuration
  - Configured workflow to run Django dev server on port 5000
  - Set up deployment configuration using Gunicorn with autoscale
  - Added .gitignore for Python/Django projects
  - Fixed messaging system bugs and performance optimizations
  - Created superuser account (username: admin, password: admin)

## Architecture
- Traditional Django MVC architecture
- SQLite for development database
- Static files served from main/static/
- Templates in main/templates/
- File uploads to certifications/ directory (configured in MEDIA_ROOT)

## Replit Configuration
- **Development Server**: Django dev server on 0.0.0.0:5000
- **Production Server**: Gunicorn with 4 workers on autoscale deployment
- **ALLOWED_HOSTS**: Configured for all hosts (Replit proxy compatibility)
- **CSRF_TRUSTED_ORIGINS**: Configured for *.replit.dev and *.repl.co domains
- **X_FRAME_OPTIONS**: Set to ALLOWALL for iframe embedding
