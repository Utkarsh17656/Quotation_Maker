from rest_framework import serializers
from .models import User, Client, Template, Quotation, QuotationItem
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['company_name'] = user.company_name
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'company_name', 'company_address', 'gst_number', 'logo', 'password')
        extra_kwargs = {'password': {'write_only': True}}
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')

class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = '__all__'

class QuotationItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationItem
        fields = ('id', 'name', 'description', 'quantity', 'unit_price', 'tax_percent', 'discount_percent', 'discount_amount', 'total')
        read_only_fields = ('id', 'total')

class QuotationSerializer(serializers.ModelSerializer):
    items = QuotationItemSerializer(many=True)
    client_name = serializers.CharField(source='client.name', read_only=True)

    class Meta:
        model = Quotation
        fields = '__all__'
        read_only_fields = ('user', 'id', 'created_at', 'updated_at', 'subtotal', 'total_tax', 'total_discount', 'grand_total')

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        quotation = Quotation.objects.create(**validated_data)
        self._calculate_and_create_items(quotation, items_data)
        return quotation

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete() # Simple replace for now
            self._calculate_and_create_items(instance, items_data)
            
        return instance
        
    def _calculate_and_create_items(self, quotation, items_data):
        subtotal = 0
        total_tax = 0
        total_discount = 0

        for item_data in items_data:
            qty = item_data.get('quantity', 1)
            price = item_data.get('unit_price', 0)
            tax_rate = item_data.get('tax_percent', 0)
            disc_rate = item_data.get('discount_percent', 0)
            disc_amt = item_data.get('discount_amount', 0)
            
            line_total_before_discount = qty * price
            
            if disc_rate > 0:
                line_discount = line_total_before_discount * (disc_rate / 100)
            else:
                line_discount = disc_amt
                
            line_total_after_discount = line_total_before_discount - line_discount
            line_tax = line_total_after_discount * (tax_rate / 100)
            final_line_total = line_total_after_discount + line_tax
            
            QuotationItem.objects.create(
                quotation=quotation,
                total=final_line_total,
                **item_data
            )
            
            subtotal += line_total_before_discount
            total_discount += line_discount
            total_tax += line_tax
            
        quotation.subtotal = subtotal
        quotation.total_discount = total_discount
        quotation.total_tax = total_tax
        quotation.grand_total = subtotal - total_discount + total_tax
        quotation.save()
