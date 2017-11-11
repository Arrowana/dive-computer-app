from flask import Flask, render_template, send_from_directory, request,\
redirect, url_for, session, flash
from flask_wtf import Form
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import Required

from dive_record import DiveRecordsGenerator
from pymongo import MongoClient
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mega string'

db = MongoClient()['divecomputer']
dive_list = []

@app.before_first_request
def setup_dives():
    global dive_list
	#random records generated at server startup
    dive_list = generate_dive_list()

def generate_dive_list():
	generator = DiveRecordsGenerator()
	dives = []
	for dive_id in range(20):
		dives.append(generator.generate_dive_records_for_one_dive(dive_id))

	return dives

@app.route('/<path:path>')
def static_proxy(path):
	return app.send_static_file(path)

@app.route('/')
def index():
	return render_template('index.html')

class LoginForm(Form):
    username = StringField(validators=[Required()])
    password = PasswordField()
    submit = SubmitField()

def credentials_correct(username, password):
	return username == password

@app.route('/login', methods=['GET', 'POST'])
def login():
	form = LoginForm()

	if form.validate_on_submit():
		username = form.username.data
		password = form.password.data
		if credentials_correct(username, password):
			session['username'] = username
			flash('Welcome back')
			return redirect(url_for('get_dives_static'))
		else:
			flash('Wrong username or password')
	return render_template('login.html', form=form)

@app.route('/upload_dive_logs')
def upload_dive_logs():
	pass

@app.route('/app')
def get_dives_static():
	return render_template('logs.html', dive_list=dive_list)

@app.route('/sync')
def sync():
	return render_template('sync.html')

@app.route('/dives')
def test():
    print('Ok')

@app.route('/raw_dives', methods=['POST'])
def post_raw_dives():
	json_content = request.get_json()
	print(json_content)

	divesB64encoded = json_content[u'divesB64encoded']
	db.users.update({'username': test_user}, {'$push': {
		'raw_dives': {
			'divesB64encoded': divesB64encoded, 'version': '0.0.1'
			}
		}
	})
	return ''

@app.route('/dive/<int:dive_id>')
def get_dive(dive_id):
	global dive_list
	dive_records_json = '['
	dive_records_json += ', '.join(dive_record.to_json() for dive_record in dive_list[dive_id])
	dive_records_json += ']'

	return dive_records_json

if __name__ == '__main__':
	app.run(debug=True)
