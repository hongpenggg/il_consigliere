# Licensed under the Apache License, Version 2.0 (the "License");

from flask import Flask, render_template, request, redirect, url_for
from game import World, Story, Stats, game

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        return redirect(url_for('index'))
    
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)