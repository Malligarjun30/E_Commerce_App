from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from rest_framework import status
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer
from rest_framework.pagination import PageNumberPagination
from elasticsearch_dsl import Search
import re
from django.contrib.auth import authenticate


class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        # Validate required fields
        if not username or not email or not password:
            return Response(
                {"error": "All fields (username, email, password) are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check for duplicate username or email
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists. Please choose a different one."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already registered. Try logging in."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Create a new user
            user = User.objects.create(
                username=username,
                email=email,
                password=make_password(password),  # Hash the password
            )
            return Response(
                {"message": "User registered successfully."},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

class CustomLoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            # Create response with access token
            response = Response({
                'access': access_token,
            })

            # Set refresh token as HttpOnly cookie
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=True,  # Use True in production (requires HTTPS)
                samesite='Strict'  # Protect against CSRF attacks
            )
            return response

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# Frontend integration (pseudo-code example for token refresh)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Blacklist the refresh token
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            # Create response and clear the cookie
            response = Response({"message": "Successfully logged out"}, status=status.HTTP_205_RESET_CONTENT)
            response.delete_cookie('refresh_token')
            return response
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CategoryList(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        paginator = PageNumberPagination()
        paginator.page_size = 5  
        categories = Category.objects.all().order_by('id')
        result_page = paginator.paginate_queryset(categories, request)
        return paginator.get_paginated_response([{
            'id': category.id,
            'name': category.name,
            'created_at': category.created_at,
        } for category in result_page])

class ProductList(APIView):
    permission_classes = [AllowAny]

    def parse_search_query(self, search_query):

        keyword = search_query
        min_price = None
        max_price = None

        # Regex to extract "below <number>" or "under <number>"
        below_match = re.search(r"(below|under) (\d+)", search_query, re.IGNORECASE)
        if below_match:
            keyword = re.sub(r"(below|under) (\d+)", "", search_query, flags=re.IGNORECASE).strip()
            max_price = float(below_match.group(2))

        # Handle "between <min> and <max>"
        between_match = re.search(r"between (\d+) and (\d+)", search_query, re.IGNORECASE)
        if between_match:
            keyword = re.sub(r"between (\d+) and (\d+)", "", search_query, flags=re.IGNORECASE).strip()
            min_price = float(between_match.group(1))
            max_price = float(between_match.group(2))

        return keyword.strip(), min_price, max_price
    
    def get(self, request, category_id=None):
        try:
            search_query = request.query_params.get('search', None)
            min_price = request.query_params.get('min_price', None)
            max_price = request.query_params.get('max_price', None)
            in_stock = request.query_params.get('in_stock', None)

            # If a search query exists, parse it
            if search_query:
                keyword, parsed_min_price, parsed_max_price = self.parse_search_query(search_query)
                min_price = min_price or parsed_min_price
                max_price = max_price or parsed_max_price

                # Build Elasticsearch query
                s = Search(index='ecommerceproducts').query("bool", must=[
                    {"multi_match": {
                        "query": keyword,
                        "fields": ["name"]  # Searches the `name` field
                    }},
                ])

                # Add range filters to the `filter` section
                if min_price:
                    s = s.filter("range", price={"gte": float(min_price)})
                if max_price:
                    s = s.filter("range", price={"lte": float(max_price)})
                if in_stock == 'true':
                    s = s.filter("range", stock={"gt": 0})

                # Execute the query
                response = s.execute()
                products = [
                    {
                        'id': hit.meta.id,
                        'name': hit.name,
                        'price': hit.price,
                        'stock': hit.stock,
                    }
                    for hit in response
                ]
            else:
                # Use Django ORM for category filtering and non-search queries
                if category_id:
                    products = Product.objects.filter(category_id=category_id)
                else:
                    products = Product.objects.all()

                # Apply filters
                if min_price:
                    products = products.filter(price__gte=float(min_price))
                if max_price:
                    products = products.filter(price__lte=float(max_price))
                if in_stock == 'true':
                    products = products.filter(stock__gt=0)

                paginator = PageNumberPagination()
                paginator.page_size = 5
                result_page = paginator.paginate_queryset(products, request)

                return paginator.get_paginated_response([{
                    'id': product.id,
                    'name': product.name,
                    'price': product.price,
                    'stock': product.stock,
                } for product in result_page])

            # Paginate Elasticsearch results
            paginator = PageNumberPagination()
            paginator.page_size = 5
            result_page = paginator.paginate_queryset(products, request)

            return paginator.get_paginated_response(result_page)

        except Product.DoesNotExist:
            return Response({'Error': 'Category does not exist'}, status=404)
