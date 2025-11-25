from rest_framework import serializers
from .models import Category, Product, Order

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class ProductSerializer(serializers.ModelSerializer):
    # We want to see the Category Name, not just the ID number
    category_name = serializers.CharField(source='category.name', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'seller_name', 'category', 'category_name', 
            'title', 'description', 'price', 'is_active', 
            'specifications', 'created_at'
        ]

class OrderSerializer(serializers.ModelSerializer):
    buyer = serializers.ReadOnlyField(source='buyer.username')
    product_title = serializers.ReadOnlyField(source='product.title')

    class Meta:
        model = Order
        fields = ['id', 'buyer', 'product', 'product_title', 'agreed_price', 'status', 'created_at']