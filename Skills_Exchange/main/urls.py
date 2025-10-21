from django.urls import path
from . import views

urlpatterns = [
    path('index/', views.index_view, name='index'),
    path('marketplace/', views.marketplace_view, name='marketplace'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path("admin-dashboard/", views.admin_dashboard, name="admin_dashboard"),

]
