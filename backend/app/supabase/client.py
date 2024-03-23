from supabase import create_client, Client
from app.core.config import settings
import vecs

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
service_client: Client = create_client(
    settings.SUPABASE_URL, settings.SERVICE_SUPABASE_KEY
)

vector_client = vecs.create_client(settings.DATABASE_URL)
