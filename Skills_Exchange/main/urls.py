from django.urls import path
from . import views

urlpatterns = [
    path('', views.index_view, name='index'),
    path('index/', views.index_view, name='index_alt'),
    path('marketplace/', views.marketplace_view, name='marketplace'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path("logout/", views.logout_view, name="logout"),
    path("admin-dashboard/", views.admin_dashboard, name="admin_dashboard"),
    path("admin-users/", views.admin_users, name="admin_users"),
    path('admin-exchanges/', views.admin_exchanges, name='admin_exchanges'),
    path("admin-users/delete/<int:user_id>/", views.admin_delete_user, name="admin_delete_user"),
    path("admin-users/toggle-staff/<int:user_id>/", views.admin_toggle_staff, name="admin_toggle_staff"),
    path("profile/<int:user_id>/", views.profile_view, name="profile"),
    path("create-profile/", views.create_profile, name="create_profile"),
    path('dashboard/', views.dashboard_view, name="dashboard"),
    path('exchanges/', views.exchanges_view, name='exchanges'),
    path('exchange/start/<int:user_id>/<int:skill_id>/', views.start_exchange, name='start_exchange'),
    path("manage-skills/", views.manage_skills, name="manage_skills"),
    path("propose-exchange/<int:user_skill_id>/", views.propose_exchange_view, name="propose_exchange"),
    path("exchange/accept/<int:exchange_id>/", views.accept_exchange, name="accept_exchange"),
    path("exchange/reject/<int:exchange_id>/", views.reject_exchange, name="reject_exchange"),
    path("exchange/complete/<int:exchange_id>/", views.mark_exchange_complete, name="mark_exchange_complete"),
    path("messages/", views.messages_view, name="messages"),
    path("messages/<int:user_id>/", views.messages_view, name="conversation"),
    path("devteam/", views.devteam_view, name="devteam"),
]
