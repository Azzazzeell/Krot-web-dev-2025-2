import pytest
from app import app, User
from flask import session, get_flashed_messages
from flask_login import current_user

@pytest.fixture
def client():
    app.config.update({
        'TESTING': True,
        'WTF_CSRF_ENABLED': False,
        'SERVER_NAME': 'localhost:5000'
    })
    return app.test_client()

def test_visit_counter(client):
    with client:
        response = client.get('/')
        assert session.get('visits') == 1
        assert b'Visits: 1' in response.data
        
        response = client.get('/')
        assert session.get('visits') == 2
        assert b'Visits: 2' in response.data

def test_login_success(client):
    response = client.post('/login', data={
        'username': 'user',
        'password': 'qwerty'
    }, follow_redirects=True)
    assert response.status_code == 200
    assert b'Successfully logged in' in response.data

def test_login_failure(client):
    response = client.post('/login', data={
        'username': 'wrong',
        'password': 'wrong'
    }, follow_redirects=True)
    assert b'Invalid username or password' in response.data

def test_secret_access_authorized(client):
    client.post('/login', data={
        'username': 'user',
        'password': 'qwerty'
    }, follow_redirects=True)
    response = client.get('/secret')
    assert response.status_code == 200
    assert b'Authenticated users only' in response.data

def test_secret_access_unauthorized(client):
    response = client.get('/secret', follow_redirects=True)
    assert response.request.path == '/login'
    assert b'Please log in' in response.data

def test_redirect_after_login(client):
    response = client.get('/secret', follow_redirects=False)
    assert response.status_code == 302
    assert '/login?next=%2Fsecret' in response.location
    
    response = client.post('/login',
        data={'username': 'user', 'password': 'qwerty'},
        query_string={'next': '/secret'},
        follow_redirects=True
    )
    assert response.status_code == 200
    assert b'Secret Page' in response.data

def test_logout(client):
    with client:
        client.post('/login', data={'username': 'user', 'password': 'qwerty'})
        assert current_user.is_authenticated
        
        response = client.get('/logout', follow_redirects=True)
        assert not current_user.is_authenticated
        assert b'Login' in response.data

def test_navbar_links_authenticated(client):
    client.post('/login', data={
        'username': 'user',
        'password': 'qwerty'
    })
    response = client.get('/')
    assert b'Logout' in response.data
    assert b'Secret' in response.data

def test_navbar_links_anonymous(client):
    response = client.get('/')
    assert b'Login' in response.data
    assert b'Logout' not in response.data

def test_session_visits_isolation():
    client1 = app.test_client()
    client2 = app.test_client()
    
    with client1.session_transaction() as sess:
        sess['visits'] = 5
    
    with client2.session_transaction() as sess:
        assert 'visits' not in sess