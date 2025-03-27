from flask import Flask, session, render_template, redirect, url_for, request, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from datetime import timedelta

app = Flask(__name__)
app.secret_key = 'supersecretkey'

# Конфигурация Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.remember_cookie_name = 'remember_token'
login_manager.remember_cookie_duration = timedelta(days=1)
login_manager.session_protection = "strong"

class User(UserMixin):
    def __init__(self, user_id):
        self.id = user_id

users = {'user': {'password': 'qwerty'}}

@login_manager.user_loader
def load_user(user_id):
    return User(user_id) if user_id in users else None

@app.route('/')
def index():
    session['visits'] = session.get('visits', 0) + 1
    return render_template('index.html', visits=session['visits'])

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        remember = request.form.get('remember_me') == 'on'

        if username in users and users[username]['password'] == password:
            user = User(username)
            login_user(user, remember=remember)
            flash('Successfully logged in!', 'success')
            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
        flash('Invalid username or password', 'error')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/secret')
@login_required
def secret():
    return render_template('secret.html')

if __name__ == '__main__':
    app.run(debug=True)