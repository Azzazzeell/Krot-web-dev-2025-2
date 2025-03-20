import pytest
from flask import url_for
from app import app as flask_app
from app import posts_list  
from datetime import datetime

@pytest.fixture
def app():
    flask_app.config.update({'TESTING': True})
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()

def test_index_route(client):
    response = client.get('/')
    assert response.status_code == 200
    assert 'Лабораторная работа №1'.encode('utf-8') in response.data

def test_posts_route(client):
    response = client.get('/posts')
    assert response.status_code == 200
    assert b'<h1 class="my-5">\xd0\x9f\xd0\xbe\xd1\x81\xd1\x82\xd1\x8b</h1>' in response.data	
	
def test_post_page(client):
    response = client.get('/posts/0')
    assert response.status_code == 200
    assert 'Заголовок поста'.encode('utf-8') in response.data
    assert 'Оставьте комментарий'.encode('utf-8') in response.data

def test_404(client):
    response = client.get('/posts/999')
    assert response.status_code == 404

def test_post_author(client):
    post = posts_list[0]  
    assert post['author'].encode('utf-8') in client.get('/posts/0').data

def test_post_date_format(client):
    post = posts_list[0]
    assert post['date'].strftime('%d.%m.%Y').encode('utf-8') in client.get('/posts/0').data

def test_post_content(client):
    post = posts_list[0]
    assert post['text'].encode('utf-8') in client.get('/posts/0').data

def test_comments_exist(client):
    response = client.get('/posts/0')
    assert 'Комментарии'.encode('utf-8') in response.data
    assert b'media-body' in response.data

def test_image_rendering(client):
    post = posts_list[0]
    response = client.get('/posts/0')
    assert b'<img' in response.data
    assert post['image_id'].encode('utf-8') in response.data

def test_comment_form(client):
    response = client.get('/posts/0')
    assert b'<form' in response.data
    assert b'textarea' in response.data
    assert 'Отправить'.encode('utf-8') in response.data

def test_footer(client):
    response = client.get('/')
    assert 'Крот К.Д. 231-3210'.encode('utf-8') in response.data
    assert b'footer' in response.data

def test_navbar_links(client):
    response = client.get('/')
    assert b'href="/posts"' in response.data
    assert b'href="/about"' in response.data

def test_post_data_integrity():
    for post in posts_list:  
        assert 'title' in post
        assert 'author' in post
        assert isinstance(post['date'], datetime)
        assert 'comments' in post

def test_comment_replies(client):
    response = client.get('/posts/0')
    assert b'ms-5' in response.data

def test_posts_count(client):
    response = client.get('/posts')
    assert response.data.count(b'card mb-4') == 5