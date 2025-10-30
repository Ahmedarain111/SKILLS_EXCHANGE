# Skills Exchange Platform

## Overview
A Django-based web application that enables users to exchange skills with each other. The platform allows users to create profiles, list their skills, browse a marketplace of available skills, and propose skill exchanges with other users.

## Recent Changes
- **Oct 30, 2025**: Added exchange completion tracking and admin approval system
  - Added completion tracking fields to Exchange model (user1_completed, user2_completed, admin_approved)
  - Enhanced admin interface with visual indicators, filters, and batch approval actions
  - Implemented secure user-facing completion workflow with POST requests and CSRF protection
  - Updated exchange templates to display completion status
  - Workflow: Users mark their part complete → Both complete → Admin reviews and approves
- **Oct 30, 2025**: Initial project import and setup for Replit environment
  - Configured Django to run on port 5000 with 0.0.0.0 binding
  - Added STATIC_ROOT for static file collection
  - Set up workflow for development server
  - Added .pythonlibs to .gitignore

## Project Architecture

### Technology Stack
- **Framework**: Django 5.2.7
- **Database**: SQLite (development)
- **Frontend**: HTML templates with CSS and JavaScript
- **Image Processing**: Pillow
- **Production Server**: Gunicorn

### Project Structure
```
Skills_Exchange/
├── main/                          # Main Django app
│   ├── migrations/                # Database migrations
│   ├── static/                    # Static files (CSS, JS, images)
│   │   ├── css/                  # Stylesheets
│   │   ├── js/                   # JavaScript files
│   │   └── images/               # Image assets
│   ├── templates/                # HTML templates
│   │   ├── index.html           # Landing page
│   │   ├── marketplace.html     # Skills marketplace
│   │   ├── profile.html         # User profile
│   │   ├── messages.html        # Messaging system
│   │   └── ...                  # Other templates
│   ├── models.py                 # Data models
│   ├── views.py                  # View logic
│   ├── urls.py                   # URL routing
│   ├── forms.py                  # Form definitions
│   ├── middleware.py             # Custom middleware (NoCacheMiddleware)
│   └── admin.py                  # Admin interface
├── Skills_Exchange/              # Project settings
│   ├── settings.py               # Django settings
│   ├── urls.py                   # Root URL configuration
│   └── wsgi.py                   # WSGI application
├── manage.py                     # Django management script
├── requirements.txt              # Python dependencies
└── db.sqlite3                    # SQLite database
```

### Key Features
1. **User Authentication**: Login/signup system with profile creation
2. **Skill Marketplace**: Browse available skills from other users
3. **Profile Management**: Users can add/manage their skills and certifications
4. **Exchange System**: Propose and manage skill exchanges
5. **Messaging**: Communication between users
6. **Admin Dashboard**: Administrative interface for managing users and exchanges

### Configuration Notes
- **ALLOWED_HOSTS**: Set to `['*']` for Replit development
- **X_FRAME_OPTIONS**: Set to `ALLOWALL` for Replit preview iframe
- **CSRF_TRUSTED_ORIGINS**: Configured for `*.replit.dev` and `*.repl.co`
- **NoCacheMiddleware**: Custom middleware to prevent caching issues in development

## Development

### Running the Application
The Django development server runs automatically on port 5000:
```bash
cd Skills_Exchange && python manage.py runserver 0.0.0.0:5000
```

### Database Migrations
To apply database migrations:
```bash
cd Skills_Exchange && python manage.py migrate
```

### Static Files
To collect static files:
```bash
cd Skills_Exchange && python manage.py collectstatic --noinput
```

### Admin Access
To create a superuser for admin access:
```bash
cd Skills_Exchange && python manage.py createsuperuser
```

## Dependencies
- Django >= 5.2.6
- Pillow (for image handling)
- Gunicorn (for production deployment)

## User Preferences
None specified yet.
