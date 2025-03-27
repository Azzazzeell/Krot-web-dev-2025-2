from flask import Flask, render_template, request, make_response, redirect, url_for
import re

app = Flask(__name__)

@app.route('/')
def index():
    return redirect(url_for('url_params'))

@app.route('/url_params')
def url_params():
    return render_template('url_params.html', params=request.args)

@app.route('/headers')
def headers():
    return render_template('headers.html', headers=request.headers)

@app.route('/cookies')
def cookies():
    cookie_name = 'visited'
    visited = request.cookies.get(cookie_name)
    resp = make_response(render_template('cookies.html', visited=visited))
    if visited:
        resp.delete_cookie(cookie_name)
    else:
        resp.set_cookie(cookie_name, 'yes', max_age=60*60*24)
    return resp

@app.route('/form', methods=['GET', 'POST'])
def form_data():
    if request.method == 'POST':
        return render_template('form_data.html', form=request.form)
    return render_template('form_data.html')

@app.route('/phone', methods=['GET', 'POST'])
def phone():
    error = None
    formatted = None
    if request.method == 'POST':
        phone_input = request.form.get('phone', '')
        
        # Проверка на недопустимые символы и плюсы
        if (
            not re.fullmatch(r'^[\d+\-()\.\s]*$', phone_input) or
            phone_input.count('+') > 1 or
            ('+' in phone_input and not phone_input.startswith('+'))
        ):
            error = ('invalid_chars', 'Недопустимый ввод. В номере телефона встречаются недопустимые символы.')
        else:
            cleaned_digits = re.sub(r'\D', '', phone_input)
            
            # Корректировка префикса
            if cleaned_digits.startswith('7') and len(cleaned_digits) == 11:
                cleaned_digits = '8' + cleaned_digits[1:]
            elif len(cleaned_digits) == 10:
                cleaned_digits = '8' + cleaned_digits
            
            # Проверка длины
            required_length = 11 if cleaned_digits.startswith('8') else 10
            if len(cleaned_digits) != required_length:
                error = ('invalid_length', 'Недопустимый ввод. Неверное количество цифр.')
            else:
                # Форматирование
                formatted = '-'.join([
                    cleaned_digits[0],
                    cleaned_digits[1:4],
                    cleaned_digits[4:7],
                    cleaned_digits[7:9],
                    cleaned_digits[9:11]
                ]).rstrip('-')
    
    return render_template('phone.html', error=error, formatted=formatted)

if __name__ == '__main__':
    app.run(debug=True)