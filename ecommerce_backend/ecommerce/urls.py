from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import CategoryList, ProductList,RegisterView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('categories/', CategoryList.as_view(),name='categories'),
    path('products/', ProductList.as_view(), name='all_products'),  # For fetching all products
    path('products/<int:category_id>/', ProductList.as_view(), name='products_by_category'),
]