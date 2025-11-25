from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)  # e.g., "Livestock", "Gifts", "Attire"
    slug = models.SlugField(unique=True)     # e.g., "livestock" (for clean URLs)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Product(models.Model):
    # Link the product to the User who is selling it (The Farmer or Merchant)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    
    title = models.CharField(max_length=200) # e.g., "Nguni Bull - 3 Years"
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Supports up to R99,999,999.99
    
    # Is the item still available?
    is_active = models.BooleanField(default=True)
    
    # THE SECRET WEAPON: This field allows us to store different data for Cows vs Whiskey
    # Example Cow: {"breed": "Brahman", "weight": "450kg", "gender": "Male"}
    # Example Whiskey: {"brand": "Jameson", "years": 18}
    specifications = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Order(models.Model):
    STATUS_CHOICES = (
        ('negotiation', 'Negotiation Pending'),
        ('accepted', 'Offer Accepted'),
        ('paid', 'Paid'),
        ('completed', 'Delivered/Collected'),
    )

    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    
    # We store the agreed price separately, because it might differ from the listed price (Negotiation!)
    agreed_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='negotiation')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} - {self.product.title}"