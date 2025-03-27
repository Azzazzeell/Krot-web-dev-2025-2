import pytest
import re
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

# Тесты для параметров URL
def test_url_params_display(client):
    response = client.get('/url_params?name=John&age=30')
    assert b'name: John' in response.data
    assert b'age: 30' in response.data

def test_empty_url_params(client):
    response = client.get('/url_params')
    assert b'URL Parameters' in response.data

# Тесты для заголовков
def test_headers_display(client):
    response = client.get('/headers')
    assert b'User-Agent' in response.data
    assert b'Headers' in response.data

# Тесты для cookies
def test_set_cookie(client):
    response = client.get('/cookies')
    assert 'visited=yes' in response.headers.get('Set-Cookie', '')

def test_delete_cookie(client):
    client.set_cookie('localhost', 'visited', 'yes')
    response = client.get('/cookies')
    assert 'visited=;' in response.headers.get('Set-Cookie', '')

# Тесты для формы
def test_form_data_display(client):
    response = client.post('/form', data={'email': 'test@example.com'})
    assert b'email: test@example.com' in response.data

# Тесты для валидации телефона
valid_numbers = [
    ('+7 (123) 456-75-90', '8-123-456-75-90'),
    ('8(123)4567590', '8-123-456-75-90'),
    ('123.456.75.90', '8-123-456-75-90'),
    ('+7 999 1234567', '8-999-123-45-67'),
]

invalid_length_cases = [
    ('+7123', 'invalid_length'),
    ('812345678', 'invalid_length'),
    ('12345678901', 'invalid_length'),
]

invalid_chars_cases = [
    ('+7(123)abc', 'invalid_chars'),
    ('8-9O8-1234', 'invalid_chars'),
    ('123#456$75', 'invalid_chars'),
]

@pytest.mark.parametrize('input,expected', valid_numbers)
def test_valid_phone_numbers(client, input, expected):
    response = client.post('/phone', data={'phone': input})
    assert expected.encode() in response.data

@pytest.mark.parametrize('input,error_type', invalid_length_cases)
def test_invalid_length(client, input, error_type):
    response = client.post('/phone', data={'phone': input})
    error_message = u'Недопустимый ввод. Неверное количество цифр.'.encode('utf-8')
    assert error_message in response.data
    assert b'is-invalid' in response.data

@pytest.mark.parametrize('input,error_type', invalid_chars_cases)
def test_invalid_chars(client, input, error_type):
    response = client.post('/phone', data={'phone': input})
    error_message = u'Недопустимый ввод. В номере телефона встречаются недопустимые символы.'.encode('utf-8')
    assert error_message in response.data
    assert b'is-invalid' in response.data

def test_phone_with_plus_not_first(client):
    response = client.post('/phone', data={'phone': '12+3456'})
    error_message = u'Недопустимый ввод. В номере телефона встречаются недопустимые символы.'.encode('utf-8')
    assert error_message in response.data

def test_multiple_plus_signs(client):
    response = client.post('/phone', data={'phone': '+7+123'})
    error_message = u'Недопустимый ввод. В номере телефона встречаются недопустимые символы.'.encode('utf-8')
    assert error_message in response.data

def test_empty_phone_submission(client):
    response = client.post('/phone', data={'phone': ''})
    assert b'is-invalid' in response.data

def test_correct_formatting_8_start(client):
    response = client.post('/phone', data={'phone': '8(912)345-67-89'})
    assert b'8-912-345-67-89' in response.data

def test_correct_formatting_7_start(client):
    response = client.post('/phone', data={'phone': '+7 912 345 67 89'})
    assert b'8-912-345-67-89' in response.data