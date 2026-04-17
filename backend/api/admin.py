from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Client, Template, Quotation, QuotationItem

class QuotationItemInline(admin.TabularInline):
    model = QuotationItem
    extra = 1

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'company_name', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Company Info', {'fields': ('company_name', 'company_address', 'gst_number', 'logo')}),
    )

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'email', 'phone', 'zip_code', 'created_at')
    search_fields = ('name', 'email', 'zip_code')
    list_filter = ('user',)

@admin.register(Quotation)
class QuotationAdmin(admin.ModelAdmin):
    list_display = ('quotation_number', 'client', 'user', 'status', 'grand_total', 'date')
    list_filter = ('status', 'date', 'user')
    search_fields = ('quotation_number', 'client__name')
    inlines = [QuotationItemInline]
    readonly_fields = ('subtotal', 'total_tax', 'total_discount', 'grand_total')

@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'identifier')
