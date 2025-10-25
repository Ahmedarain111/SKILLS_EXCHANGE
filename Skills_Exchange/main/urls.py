from django.urls import path
from . import views

urlpatterns = [
    path('index/', views.index_view, name='index'),
    path('marketplace/', views.marketplace_view, name='marketplace'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path("admin-dashboard/", views.admin_dashboard, name="admin_dashboard"),
    path("admin-users/", views.admin_users, name="admin_users"),
    path('admin-exchanges/', views.admin_exchanges, name='admin_exchanges'),
    path('profile/create', views.create_profile, name='create_profile'),
    path('dashboard/', views.dashboard_view, name="dashboard"),
    path('exchange/start/<int:user_id>/<int:skill_id>/', views.start_exchange, name='start_exchange'),
]
