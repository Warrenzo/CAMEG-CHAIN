from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.main import app

engine = create_engine('sqlite:///./tmp_test.db', connect_args={'check_same_thread': False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

Base.metadata.create_all(bind=engine)
app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)
payload = {'email': 'supplier@example.com','password': 'SupplierPass123!','company_name': 'Test Pharma SARL','country': 'Togo','phone_number': '+22898765432'}
response = client.post('/api/v1/auth/register/phase1', json=payload)
print(response.status_code)
print(response.text)
Base.metadata.drop_all(bind=engine)
