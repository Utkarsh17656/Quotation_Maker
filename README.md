# QuoteCraft - Modern SaaS Quotation Generator

QuoteCraft is a production-ready, full-stack SaaS application for creating, managing, and exporting professional business quotations and invoices. Drawing inspiration from modern platforms like Refrens, it offers a premium, responsive UI featuring a split-pane Quotation Builder with real-time PDF preview functionality.

Built to be fast, scalable, and aesthetically pleasing with intelligent auto-calculations and comprehensive client management.

---

## 🏗️ Technology Stack

**Frontend**
- React 18
- Vite (Fast bundling)
- Tailwind CSS (Utility-first styling system)
- Zustand (Global state management)
- React Router DOM (Routing)
- html2pdf.js (High-quality PDF generation)
- Lucide React (Beautiful, sharp icons)

**Backend**
- Django 6.0.4
- Django REST Framework (DRF)
- JWT Authentication (djangorestframework-simplejwt)
- PostgreSQL Support (Configured for SQLite by default for rapid local development)
- DRF Spectacular (OpenAPI 3 schema generation)

---

## 🚀 Key Features

* **Advanced Quotation Builder:** Split-pane interface allowing users to edit line items, notes, taxes, and discounts on the left, while instantly previewing the final print layout on the right.
* **Intelligent Auto-Calculations:** Instantly computes subtotals, item-level discounts, line taxes, and aggregate grand totals.
* **High-Fidelity PDF Export:** 1:1 match between the Live Preview and the final exported PDF, utilizing robust HTML-to-PDF rendering pipelines.
* **Client CRM:** Easily manage your business client roster. Store names, contact information, billing addresses, and GST identifiers. 
* **Global Authentication:** Secure JWT-based access with persistent sessions and automated token refresh cycles.
* **Dashboard Analytics:** High-level summary displaying total generated revenue, volume metrics, and recent activity.

---

## ⚙️ Local Development Setup

The application uses a separated Monorepo frontend/backend architecture. You'll need two terminal sessions to run both servers simultaneously.

### 1. Backend Initialization

Ensure you have Python 3.10+ installed.

```bash
cd backend

# Create isolated Python environment
python -m venv venv

# Activate environment (Windows)
.\venv\Scripts\activate
# Activate environment (Mac/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
# (Note: requirements.txt dependencies are pre-installed in the provided environment)

# Run database migrations
python manage.py migrate

# Create a superuser (optional, for admin access)
python manage.py createsuperuser

# Start the REST API server (Runs on port 8000)
python manage.py runserver
```

### 2. Frontend Initialization

Ensure you have Node.js 18+ installed.

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server (Runs on port 5173)
npm run dev
```

---

## 🗄️ Extending to PostgreSQL

We have pre-configured `psycopg2-binary` in the backend environment. To switch from SQLite to PostgreSQL for production environments:

1. Open `backend/quotecraft/settings.py`.
2. Locate the `DATABASES` configuration block.
3. Replace it with your Postgres connection string:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'quotecraft_db',
           'USER': 'your_db_user',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```
4. Run `python manage.py migrate` to structure your new Postgres tables.

---

## 🔐 API Documentation (Swagger)
Once the backend is running, you can access the automatically generated OpenAPI 3.0 documentation via DRF Spectacular:
- Swagger UI: `http://localhost:8000/api/docs/`
- Schema JSON: `http://localhost:8000/api/schema/`

---

## 📄 License
Internal proprietary software setup for SaaS deployment. All rights reserved.
"# Quotation_Maker" 
