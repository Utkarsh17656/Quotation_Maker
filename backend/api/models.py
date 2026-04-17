from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

class User(AbstractUser):
    company_name = models.CharField(max_length=255, blank=True, null=True)
    company_address = models.TextField(blank=True, null=True)
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    
    def __str__(self):
        return self.username

class Client(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clients')
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Template(models.Model):
    name = models.CharField(max_length=100)
    identifier = models.CharField(max_length=50, unique=True) # e.g., 'minimal', 'classic', 'modern'

    def __str__(self):
        return self.name

class Quotation(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('Sent', 'Sent'),
        ('Viewed', 'Viewed'),
        ('Accepted', 'Accepted'),
        ('Invoiced', 'Invoiced'),
        ('Rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quotations')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='quotations')
    template = models.ForeignKey(Template, on_delete=models.SET_NULL, null=True, blank=True)
    
    quotation_number = models.CharField(max_length=100)
    date = models.DateField()
    expiry_date = models.DateField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    
    notes = models.TextField(blank=True, null=True)
    terms = models.TextField(blank=True, null=True)
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    grand_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'quotation_number')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quotation_number} - {self.client.name}"

class QuotationItem(models.Model):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0) # e.g. 18.00 for 18%
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Optional auto-calculated fields for convenience
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return self.name
