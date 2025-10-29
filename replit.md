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
- 2025-10-29: Initial import and Replit environment setup
  - Installed Python 3.11 with Django 5.2.7, Pillow, and Gunicorn
  - Configured Django settings for Replit environment (ALLOWED_HOSTS, CSRF_TRUSTED_ORIGINS)
  - Fixed duplicate DIRS in TEMPLATES configuration
  - Added media file serving configuration
  - Configured workflow to run Django dev server on port 5000
  - Set up deployment configuration using Gunicorn with autoscale
  - Added .gitignore for Python/Django projects

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
