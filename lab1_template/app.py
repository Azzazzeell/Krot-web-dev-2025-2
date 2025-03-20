import random
from flask import Flask, render_template, abort
from faker import Faker

fake = Faker()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret-key'

images_ids = [
    '7d4e9175-95ea-4c5f-8be5-92a6b708bb3c.jpg',
    '2d2ab7df-cdbc-48a8-a936-35bba702def5.jpg',
    '6e12f3de-d5fd-4ebb-855b-8cbc485278b7.jpg',
    'afc2cfe7-5cac-4b80-9b9a-d5c65ef0c728.jpg',
    'cab5b7f2-774e-4884-a200-0c0180fa777f.jpg'
]

def generate_comments(replies=True):
    comments = []
    for _ in range(random.randint(1, 3)):
        comment = {'author': fake.name(), 'text': fake.text()}
        if replies:
            comment['replies'] = generate_comments(replies=False)
        comments.append(comment)
    return comments

def generate_post(index):
    return {
        'title': 'Заголовок поста',
        'text': fake.paragraph(nb_sentences=100),
        'author': fake.name(),
        'date': fake.date_time_between(start_date='-2y', end_date='now'),
        'image_id': images_ids[index],
        'comments': generate_comments()
    }

posts_list = sorted(
    [generate_post(i) for i in range(5)],
    key=lambda x: x['date'], 
    reverse=True
)

app.posts_list = posts_list

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/posts')
def posts():
    return render_template('posts.html', title='Посты', posts=posts_list)

@app.route('/posts/<int:index>')
def post(index):
    try:
        post_data = posts_list[index]
    except IndexError:
        abort(404)
    return render_template('post.html', title=post_data['title'], post=post_data)

@app.route('/about')
def about():
    return render_template('about.html', title='Об авторе')

if __name__ == '__main__':
    app.run(debug=True)