from django.contrib import admin
from .models import Category, Product, Order

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    # This automatically fills the "slug" field when you type the name
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'seller', 'price', 'category', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['title', 'description']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'buyer', 'product', 'agreed_price', 'status']
    list_filter = ['status']